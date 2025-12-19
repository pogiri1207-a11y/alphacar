import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RedisService } from './redis/redis.service'; 
import { Vehicle, VehicleDocument } from '../schemas/vehicle.schema';

// [중요] 다른 파일들이 이 이름을 찾고 있으므로 'VehiclesService'로 지정합니다.
@Injectable()
export class VehicleService {
  // 로그를 보면 코드가 적용됐는지 바로 알 수 있게 'FINAL-FIX'라고 적었습니다.
  private readonly logger = new Logger('VehiclesService-FINAL-FIX');

  constructor(
    @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
    private readonly redisService: RedisService
  ) {}

  // 1. 전체 차량 조회
  async findAll(): Promise<Vehicle[]> {
    return this.vehicleModel.find().exec();
  }

  // 2. 특정 차량 상세 조회 (기본 ID 조회)
  async findOne(id: string): Promise<Vehicle> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID 형식 오류: ${id}`);
    }
    const vehicle = await this.vehicleModel.findById(id).exec();
    if (!vehicle) throw new NotFoundException(`차량 없음: ${id}`);
    return vehicle;
  }

  // ==========================================================
  // [핵심] danawa_vehicle_data 컬렉션에서만 검색 (트림 ID, 차량 ID, 차량 이름, lineup_id 모두 처리)
  // ==========================================================
  async findOneByTrimId(trimId: string, modelName?: string): Promise<any | null> {
    this.logger.log(`🔍 [danawa_vehicle_data 전용] 검색 요청: "${trimId}"${modelName ? `, modelName: "${modelName}"` : ''}`);

    let vehicle: any = null;

    // [CASE 1] MongoDB ObjectId 형식인 경우
    if (Types.ObjectId.isValid(trimId)) {
      this.logger.log(`   👉 ObjectId 형식 감지됨. danawa_vehicle_data에서 검색...`);
      const objectId = new Types.ObjectId(trimId);
      
      // danawa_vehicle_data 컬렉션에서만 검색
      vehicle = await this.vehicleModel.findOne({
        $or: [
          { _id: objectId },            // 차량 본체 ID
          { 'trims._id': objectId },    // 트림 ID
          { 'trims._id': trimId }       // (혹시 모를) 문자열 트림 ID
        ]
      }).lean().exec();

      if (vehicle) {
        this.logger.log(`🎉 [성공] ObjectId로 차량 찾음: ${vehicle['name'] || vehicle['vehicle_name']}`);
      } else {
        this.logger.warn(`   ⚠️ ObjectId로 못 찾음. lineup_id 검색으로 전환합니다.`);
      }
    } 
    
    // [CASE 2] lineup_id로 검색 (메인 페이지에서 vehicleId로 사용됨)
    if (!vehicle) {
      const decodedId = decodeURIComponent(trimId).trim();
      this.logger.log(`   👉 lineup_id 검색 시도: "${decodedId}"`);
      
      vehicle = await this.vehicleModel.findOne({
        lineup_id: decodedId
      }).lean().exec();

      if (vehicle) {
        this.logger.log(`🎉 [성공] lineup_id로 차량 찾음: ${vehicle['name'] || vehicle['vehicle_name']}`);
      }
    }
    
    // [CASE 3] 트림 이름으로 검색 시도
    if (!vehicle) {
      const decodedId = decodeURIComponent(trimId).trim();
      // "Reserve A/T:1" 형식에서 실제 트림 이름만 추출 (":숫자" 제거)
      const trimNameOnly = decodedId.split(':')[0].trim();
      this.logger.log(`   👉 트림 이름 검색 시도: "${trimNameOnly}" (원본: "${decodedId}")`);
      
      // 차종 이름이 있으면 함께 검색 (더 정확한 매칭)
      if (modelName && modelName.trim()) {
        const decodedModelName = decodeURIComponent(modelName).trim();
        this.logger.log(`   👉 차종 이름과 함께 검색: "${decodedModelName}"`);
        
        // 차종 이름과 트림 이름을 함께 사용하여 검색
        vehicle = await this.vehicleModel.findOne({
          $and: [
            { vehicle_name: decodedModelName },
            { 'trims.trim_name': trimNameOnly }
          ]
        }).lean().exec();

        if (vehicle) {
          this.logger.log(`🎉 [성공] 차종명+트림명으로 차량 찾음: ${vehicle['name'] || vehicle['vehicle_name']}`);
        } else {
          // 부분 일치로 검색
          this.logger.log(`   👉 정확 일치 실패. 부분 일치로 검색 시도...`);
          vehicle = await this.vehicleModel.findOne({
            $and: [
              { vehicle_name: { $regex: decodedModelName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
              { 'trims.trim_name': { $regex: trimNameOnly.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }
            ]
          }).lean().exec();

          if (vehicle) {
            this.logger.log(`🎉 [성공] 차종명+트림명(부분 일치)으로 차량 찾음: ${vehicle['name'] || vehicle['vehicle_name']}`);
          }
        }
      }
      
      // 차종 이름이 없거나 위에서 못 찾은 경우, 트림 이름만으로 검색
      if (!vehicle) {
        this.logger.log(`   👉 트림 이름만으로 검색 시도...`);
        // 정확히 일치하는 경우
        vehicle = await this.vehicleModel.findOne({
          'trims.trim_name': trimNameOnly
        }).lean().exec();

        if (vehicle) {
          this.logger.log(`🎉 [성공] 트림 이름(정확 일치)으로 차량 찾음: ${vehicle['name'] || vehicle['vehicle_name']}`);
        } else {
          // 부분 일치로 검색 (대소문자 무시)
          this.logger.log(`   👉 정확 일치 실패. 부분 일치로 검색 시도...`);
          vehicle = await this.vehicleModel.findOne({
            'trims.trim_name': { $regex: trimNameOnly.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
          }).lean().exec();

          if (vehicle) {
            this.logger.log(`🎉 [성공] 트림 이름(부분 일치)으로 차량 찾음: ${vehicle['name'] || vehicle['vehicle_name']}`);
          } else {
            // Fallback: 차량 이름으로 검색
            this.logger.log(`   👉 트림 이름으로 못 찾음. 차량 이름으로 검색 시도...`);
            vehicle = await this.vehicleModel.findOne({
              $or: [
                  { name: { $regex: trimNameOnly, $options: 'i' } },
                  { vehicle_name: { $regex: trimNameOnly, $options: 'i' } }
              ]
            }).lean().exec();

            if (vehicle) {
              this.logger.log(`🎉 [성공] 차량 이름으로 찾음: ${vehicle['name'] || vehicle['vehicle_name']}`);
            }
          }
        }
      }
    }

    if (!vehicle) {
      this.logger.error(`❌ [실패] danawa_vehicle_data에서 모든 방법으로 검색했으나 데이터가 없습니다: ${trimId}`);
      return null;
    }

    // 배기량 및 복합연비 범위 계산 (trims.specifications의 한글 필드명에서 추출)
    const displacements: number[] = [];
    const fuelEfficiencies: number[] = []; // 복합연비 배열
    
    // 배기량 추출 헬퍼 함수 ("998 cc", "1,580 cc" 형식 파싱)
    const extractDisplacement = (value: any) => {
      if (!value) return null;
      const valueStr = String(value);
      // "998 cc", "1,580 cc" 형식에서 숫자 추출 (쉼표 제거 후 파싱)
      const num = parseFloat(valueStr.replace(/[^0-9.]/g, ''));
      if (!isNaN(num) && num > 0 && num < 10000) { // 10000cc 이상은 잘못된 값으로 간주
        return num;
      }
      return null;
    };
    
    // 복합연비 추출 헬퍼 함수 ("12.5 km/L", "15.2 km/l" 형식 파싱)
    const extractFuelEfficiency = (value: any) => {
      if (!value) return null;
      const valueStr = String(value);
      // "12.5 km/L", "15.2 km/l", "12.5" 형식에서 숫자 추출
      const num = parseFloat(valueStr.replace(/[^0-9.]/g, ''));
      if (!isNaN(num) && num > 0 && num < 100) { // 100 km/L 이상은 잘못된 값으로 간주
        return num;
      }
      return null;
    };
    
    // trims의 specifications에서 한글 필드명으로 직접 추출
    if (vehicle.trims && Array.isArray(vehicle.trims)) {
      vehicle.trims.forEach((trim: any) => {
        if (trim.specifications && typeof trim.specifications === 'object') {
          const specs = trim.specifications;
          
          // 한글 필드명 '배기량' 직접 확인
          if (specs.배기량) {
            const disp = extractDisplacement(specs.배기량);
            if (disp) displacements.push(disp);
          }
          
          // 한글 필드명 '복합연비' 직접 확인
          if (specs.복합연비) {
            const efficiency = extractFuelEfficiency(specs.복합연비);
            if (efficiency) fuelEfficiencies.push(efficiency);
          }
          
          // 영문 필드명도 확인 (혹시 모를 경우 대비)
          if (specs.displacement) {
            const disp = extractDisplacement(specs.displacement);
            if (disp) displacements.push(disp);
          }
          if (specs.fuel_efficiency || specs.combined_fuel_economy) {
            const efficiency = extractFuelEfficiency(specs.fuel_efficiency || specs.combined_fuel_economy);
            if (efficiency) fuelEfficiencies.push(efficiency);
          }
        }
      });
    }
    
    // 차량 최상위 레벨에서도 확인 (혹시 모를 경우 대비)
    if (vehicle.배기량) {
      const disp = extractDisplacement(vehicle.배기량);
      if (disp) displacements.push(disp);
    }
    if (vehicle.복합연비) {
      const efficiency = extractFuelEfficiency(vehicle.복합연비);
      if (efficiency) fuelEfficiencies.push(efficiency);
    }

    // 선택된 트림 찾기
    let selectedTrim: any = null;
    const decodedTrimId = decodeURIComponent(trimId).trim();
    const trimNameOnly = decodedTrimId.split(':')[0].trim();
    
    if (vehicle.trims && Array.isArray(vehicle.trims)) {
      // ObjectId로 찾기
      if (Types.ObjectId.isValid(trimId)) {
        const objectId = new Types.ObjectId(trimId);
        selectedTrim = vehicle.trims.find((t: any) => 
          t._id && (t._id.toString() === trimId || t._id.toString() === objectId.toString())
        );
      }
      
      // 트림 이름으로 찾기
      if (!selectedTrim) {
        selectedTrim = vehicle.trims.find((t: any) => 
          t.trim_name === trimNameOnly || t.trim_name === decodedTrimId
        );
      }
      
      // 부분 일치로 찾기
      if (!selectedTrim) {
        selectedTrim = vehicle.trims.find((t: any) => 
          t.trim_name && t.trim_name.toLowerCase().includes(trimNameOnly.toLowerCase())
        );
      }
      
      // 첫 번째 트림을 기본값으로 사용
      if (!selectedTrim && vehicle.trims.length > 0) {
        selectedTrim = vehicle.trims[0];
      }
    }

    // 디버깅: 실제 데이터 확인
    this.logger.log(`📊 [디버깅] 차량 데이터 확인:`);
    this.logger.log(`   - release_date: ${vehicle.release_date}`);
    this.logger.log(`   - model_year: ${vehicle.model_year}`);
    this.logger.log(`   - trims 개수: ${vehicle.trims?.length || 0}`);
    this.logger.log(`   - 선택된 트림: ${selectedTrim?.trim_name || '없음'}`);
    this.logger.log(`   - 배기량 추출 개수: ${displacements.length}`);
    this.logger.log(`   - 복합연비 추출 개수: ${fuelEfficiencies.length}`);
    if (selectedTrim && selectedTrim.specifications) {
      const specs = selectedTrim.specifications;
      this.logger.log(`   - 선택된 트림 specifications 키: ${Object.keys(specs || {}).slice(0, 15).join(', ')}`);
    }

    // 응답 데이터 구성
    const result: any = {
      ...vehicle,
      _id: vehicle._id?.toString(),
      // 제원 정보 (요약)
      specs: {
        release_date: vehicle.release_date || vehicle.model_year || null,
        displacement_range: displacements.length > 0 
          ? { min: Math.min(...displacements), max: Math.max(...displacements) }
          : null,
        fuel_efficiency_range: fuelEfficiencies.length > 0
          ? { min: Math.min(...fuelEfficiencies), max: Math.max(...fuelEfficiencies) }
          : null,
      },
      // 선택된 트림의 전체 specifications
      selectedTrimSpecs: selectedTrim?.specifications || null,
      // 색상 이미지 (최대 4개씩만 반환)
      color_images: Array.isArray(vehicle.color_images) ? vehicle.color_images.slice(0, 4) : [],
      exterior_images: Array.isArray(vehicle.exterior_images) ? vehicle.exterior_images.slice(0, 4) : [],
      interior_images: Array.isArray(vehicle.interior_images) ? vehicle.interior_images.slice(0, 4) : [],
      // 전체 이미지 배열도 포함 (프론트엔드에서 더보기용)
      all_color_images: vehicle.color_images || [],
      all_exterior_images: vehicle.exterior_images || [],
      all_interior_images: vehicle.interior_images || [],
    };

    this.logger.log(`📤 [응답] specs 데이터:`);
    this.logger.log(`   - release_date: ${result.specs.release_date}`);
    this.logger.log(`   - displacement_range: ${JSON.stringify(result.specs.displacement_range)}`);
    this.logger.log(`   - fuel_efficiency_range: ${JSON.stringify(result.specs.fuel_efficiency_range)}`);

    return result;
  }

  // ==========================================================
  // Redis 및 기타 기능 (기존 유지)
  // ==========================================================
  async addRecentView(userId: string, vehicleId: string) {
    if (!Types.ObjectId.isValid(vehicleId)) return { success: false };
    try {
        await this.redisService.addRecentView(userId, vehicleId);
        const count = await this.getRecentCount(userId);
        return { success: true, count };
    } catch (e) {
        return { success: false };
    }
  }

  async getRecentCount(userId: string): Promise<number> {
    try {
        return await this.redisService.getClient().zcard(`recent_views:${userId}`);
    } catch (e) { return 0; }
  }

  async getRecentVehicles(userId: string): Promise<any[]> {
    if (!userId) return [];
    try {
        const vehicleIds = await this.redisService.getRecentViews(userId);
        if (!vehicleIds.length) return [];
        
        const promises = vehicleIds.map(async (id) => {
            let v: any = null;
            
            // CASE 1: ObjectId 형식인 경우
            if (Types.ObjectId.isValid(id)) {
                v = await this.vehicleModel.findById(id).lean().exec();
            }
            
            // CASE 2: ObjectId가 아니면 lineup_id로 검색
            if (!v) {
                v = await this.vehicleModel.findOne({ lineup_id: id }).lean().exec();
            }
            
            // CASE 3: 여전히 못 찾으면 _id를 문자열로 변환해서 재시도
            if (!v && Types.ObjectId.isValid(id)) {
                try {
                    v = await this.vehicleModel.findById(new Types.ObjectId(id)).lean().exec();
                } catch (e) {
                    // 무시
                }
            }
            
            if (!v) return null;
            
            return {
                _id: v._id.toString(),
                name: v.vehicle_name || v.name,
                brand: v.brand_name || v.brand,
                image: v.main_image || v.image,
                price: (v.trims?.length) ? Math.min(...v.trims.map((t: any) => Number(t.price)||0)) : 0,
            };
        });
        return (await Promise.all(promises)).filter(i => i !== null);
    } catch (e) { 
        console.error('[getRecentVehicles] 에러:', e);
        return []; 
    }
  }
}
