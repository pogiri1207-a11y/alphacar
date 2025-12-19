import { Injectable, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Vehicle, VehicleDocument } from '@schemas/vehicle.schema';
import { Manufacturer, ManufacturerDocument } from './schemas/manufacturer.schema';

@Injectable()
export class AppService {
    private readonly logger = new Logger(AppService.name);

    constructor(
        @InjectModel(Manufacturer.name) private manufacturerModel: Model<ManufacturerDocument>,
        @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
    ) {}

    // 1. 제조사 목록 (danawa_vehicle_data에서 실제 존재하는 브랜드만 반환)
    async getManufacturers() {
        // danawa_vehicle_data 컬렉션에서 실제 존재하는 브랜드 목록 가져오기
        const brands = await this.vehicleModel.aggregate([
            {
                $match: {
                    $and: [
                        { brand_name: { $exists: true } },
                        { brand_name: { $ne: null } },
                        { brand_name: { $ne: '' } }
                    ]
                }
            },
            {
                $group: {
                    _id: '$brand_name',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            },
            {
                $project: {
                    _id: 0,
                    name: '$_id',
                    id: '$_id' // 브랜드 이름을 ID로 사용
                }
            }
        ]).exec();
        
        // _id 필드 추가 (프론트엔드 호환성)
        return brands.map(brand => ({
            _id: brand.id,
            name: brand.name
        }));
    }

    // 2. 모델(차종) 목록 (브랜드 이름으로 직접 조회)
    async getModelsByManufacturer(makerId: string) {
        if (!makerId) return [];
        
        // makerId가 브랜드 이름일 수 있으므로 직접 사용
        const brandName = makerId;
        
        const vehicles = await this.vehicleModel
            .find({ brand_name: brandName }, { vehicle_name: 1, _id: 1, main_image: 1, base_trim_name: 1 })
            .lean()
            .exec();
        
        // 중복 제거 (같은 vehicle_name을 가진 차량은 하나로)
        const uniqueModels = Array.from(
            new Map(vehicles.map(v => [v.vehicle_name, v])).values()
        );
        
        return uniqueModels.map(doc => ({
            _id: doc._id.toString(),
            model_name: doc.vehicle_name,
            image: doc.main_image,
            base_trim_name: doc.base_trim_name
        }));
    }

    // 3. 기본 트림 목록 (차종별로 그룹화된 기본 트림)
    // danawa_vehicle_data 컬렉션에서 해당 차량 모델의 모든 base_trim_name을 수집
    async getBaseTrimsByModel(vehicleId: string) {
        if (!vehicleId) return [];

        try {
            let vehicle: any = null;
            let vehicleName: string = '';
            let modelId: string = '';
            
            // ObjectId로 검색 시도
            if (Types.ObjectId.isValid(vehicleId)) {
                vehicle = await this.vehicleModel.findById(new Types.ObjectId(vehicleId)).lean().exec();
                if (vehicle) {
                    vehicleName = vehicle.vehicle_name || '';
                    modelId = vehicle.model_id || '';
                }
            }
            
            // ObjectId가 아니거나 못 찾은 경우, 다른 필드로 검색
            if (!vehicle) {
                // vehicle_name이나 model_id로 검색 시도
                vehicle = await this.vehicleModel.findOne({
                    $or: [
                        { model_id: vehicleId },
                        { vehicle_name: vehicleId },
                        { lineup_id: vehicleId }
                    ]
                }).lean().exec();
                
                if (vehicle) {
                    vehicleName = vehicle.vehicle_name || vehicleId;
                    modelId = vehicle.model_id || vehicleId;
                } else {
                    // vehicleId가 vehicle_name일 수도 있음
                    vehicleName = vehicleId;
                    modelId = vehicleId;
                }
            }

            // 해당 차량 모델의 모든 문서를 찾아서 base_trim_name 수집
            const query: any = {};
            
            if (vehicle && vehicle.vehicle_name) {
                // vehicle_name으로 검색 (같은 모델의 모든 변형 포함)
                query.vehicle_name = vehicle.vehicle_name;
            } else if (vehicle && vehicle.model_id) {
                // model_id로 검색
                query.model_id = vehicle.model_id;
            } else if (vehicleName) {
                // vehicleName으로 검색
                query.vehicle_name = vehicleName;
            } else {
                return [];
            }

            // 해당 차량 모델의 모든 문서 조회
            const vehicles = await this.vehicleModel.find(query).lean().exec();
            
            if (!vehicles || vehicles.length === 0) return [];

            // 모든 base_trim_name 수집 (중복 제거)
            const baseTrimMap = new Map<string, any>();
            
            vehicles.forEach((v: any) => {
                if (v.base_trim_name && v.base_trim_name.trim() !== '') {
                    const baseTrimName = v.base_trim_name.trim();
                    if (!baseTrimMap.has(baseTrimName)) {
                        baseTrimMap.set(baseTrimName, {
                            _id: baseTrimName,
                            id: baseTrimName,
                            name: baseTrimName,
                            base_trim_name: baseTrimName,
                            vehicle_id: v._id?.toString() || vehicleId,
                            vehicle_name: v.vehicle_name || vehicleName
                        });
                    }
                }
            });

            // Map에서 배열로 변환
            const baseTrims = Array.from(baseTrimMap.values());

            return baseTrims;
        } catch (e) {
            console.error('getBaseTrimsByModel 에러:', e);
            return [];
        }
    }

    // 4. 세부 트림 목록 (기본 트림 선택 후)
    async getTrimsByModel(vehicleId: string) {
        if (!vehicleId) return [];

        try {
            let vehicle: any = null;
            vehicle = await this.vehicleModel.collection.findOne({ _id: vehicleId } as any);

            if (!vehicle && Types.ObjectId.isValid(vehicleId)) {
                vehicle = await this.vehicleModel.collection.findOne({ _id: new Types.ObjectId(vehicleId) } as any);
            }

            if (!vehicle) return [];
            if (!vehicle.trims || vehicle.trims.length === 0) return [];

            return vehicle.trims.map((trim: any) => ({
                _id: trim._id,
                id: trim._id,
                name: trim.trim_name || trim.name, 
                trim_name: trim.trim_name,
                base_price: trim.price,
                price: trim.price,
                price_formatted: trim.price_formatted,
                options: trim.options || []
            }));

        } catch (e) {
            console.error(e);
            return [];
        }
    }

    // 4. 트림 상세 정보
    async getTrimDetail(trimId: string) {
        const decodedId = decodeURIComponent(trimId);
        
        if (!decodedId) throw new NotFoundException(`Trim ID가 비어있습니다.`);

        try {
            let vehicle: any = null;

            // ID 검색
            vehicle = await this.vehicleModel.collection.findOne({ 'trims._id': decodedId } as any);
            if (!vehicle && Types.ObjectId.isValid(decodedId)) {
                vehicle = await this.vehicleModel.collection.findOne({ 'trims._id': new Types.ObjectId(decodedId) } as any);
            }

            // 이름 검색 (Fallback)
            if (!vehicle) {
                vehicle = await this.vehicleModel.collection.findOne({ 'trims.trim_name': decodedId } as any);
            }
            if (!vehicle) {
                vehicle = await this.vehicleModel.collection.findOne({ 'trims.name': decodedId } as any);
            }

            if (!vehicle) {
                throw new NotFoundException(`데이터 없음: ${decodedId}`);
            }

            let trimData: any = null;
            if (vehicle.trims) {
                trimData = vehicle.trims.find((t: any) => 
                    (t._id && t._id.toString() === decodedId.toString())
                );
            }
            if (!trimData && vehicle.trims) {
                trimData = vehicle.trims.find((t: any) => 
                    t.trim_name === decodedId || t.name === decodedId
                );
            }
            
            if (!trimData) {
                throw new NotFoundException(`트림 추출 실패`);
            }

            return {
                ...trimData,
                _id: trimData._id,
                id: decodedId, 
                name: trimData.trim_name || trimData.name,
                base_price: trimData.price,
                model_name: vehicle.vehicle_name,
                manufacturer: vehicle.brand_name,
                image_url: vehicle.main_image,
                options: trimData.options || []
            };
        } catch (e) {
            if (e instanceof NotFoundException) throw e;
            throw new InternalServerErrorException("서버 오류");
        }
    }

    // 5. 비교 데이터 조회
    async getCompareData(ids: string) {
        if (!ids) return [];
        const idList = ids.split(',').filter(id => id.trim() !== '');
        const promises = idList.map(async (trimId) => {
            try { return await this.getTrimDetail(trimId); } catch (e) { return null; }
        });
        const results = await Promise.all(promises);
        return results.filter(item => item !== null);
    }

    // 6. ⭐ 비교 견적 상세 (옵션 매칭 디버깅 추가!)
    async getCompareDetails(trimId: string, optionIds: string[]) {
        console.log(`\n🕵️ [DEBUG] 옵션 매칭 시작! 트림ID: ${trimId}, 요청옵션: ${JSON.stringify(optionIds)}`);
        
        const detail = await this.getTrimDetail(trimId);
        
        let selectedOptions: any[] = [];
        const availableOptions = detail.options || [];

        console.log(`   👉 DB 보유 옵션 개수: ${availableOptions.length}개`);

        if (optionIds && optionIds.length > 0 && availableOptions.length > 0) {
             selectedOptions = availableOptions.filter((opt: any, index: number) => {
                 const realId = opt._id ? opt._id.toString() : '없음';
                 const tempId = `opt-${index}`;
                 
                 // 디버깅용 로그: 매칭 시도
                 // console.log(`      검사중[${index}]: realId=${realId}, tempId=${tempId} ...`);

                 // 1. 진짜 ID(_id) 매칭
                 if (opt._id && optionIds.includes(realId)) {
                     console.log(`      ✅ ID 매칭 성공! (${realId})`);
                     return true;
                 }
                 
                 // 2. 인덱스 매칭 (opt-0 등)
                 if (optionIds.includes(tempId)) {
                     console.log(`      ✅ 인덱스 매칭 성공! (${tempId}) -> ${opt.option_name || opt.name}`);
                     return true;
                 }

                 return false;
             });
        } else {
            console.log(`   ⚠️ 옵션 선택 불가 조건: 요청옵션(${optionIds.length}) / DB옵션(${availableOptions.length})`);
        }

        console.log(`   🏁 최종 선택된 옵션: ${selectedOptions.length}개`);

        const basePrice = detail.base_price || 0;
        const totalOptionPrice = selectedOptions.reduce((sum, opt) => {
            const price = opt.option_price || opt.price || 0;
            return sum + price;
        }, 0);

        return {
            car: {
                manufacturer: detail.manufacturer,
                model: detail.model_name,
                trim_name: detail.name,
                base_price: basePrice,
                image_url: detail.image_url,
            },
            selectedOptions: selectedOptions.map(opt => ({
                id: opt._id,
                name: opt.option_name || opt.name,
                price: opt.option_price || opt.price || 0
            })),
            totalOptionPrice,
            finalPrice: basePrice + totalOptionPrice,
        };
    }
}
