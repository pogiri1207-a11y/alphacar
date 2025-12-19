import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Vehicle } from '@schemas/vehicle.schema'; 

@Injectable()
export class VehiclesService {
  private readonly logger = new Logger(VehiclesService.name);

  constructor(
    @InjectModel(Vehicle.name) private vehicleModel: Model<Vehicle>,
  ) {}

  // 1. 전체 차량 조회 (Standard method)
  async findAll(): Promise<Vehicle[]> {
    return this.vehicleModel.find().exec();
  }

  // 2. 특정 차량 상세 조회 (ID 전용 - 엄격한 ID 형식 검사 유지)
  async findOne(id: string): Promise<Vehicle> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`요청된 차량 ID '${id}'의 형식이 유효하지 않습니다.`);
    }
    const vehicle = await this.vehicleModel.findById(id).exec();
    if (!vehicle) {
      throw new NotFoundException(`ID가 ${id}인 차량을 찾을 수 없습니다.`);
    }
    return vehicle;
  }

  // 3. 상세/비교 견적용: 트림 ID(ObjectId) 또는 이름(String)으로 유연하게 찾기
  async findOneByTrimId(identifier: string): Promise<Vehicle> {
    this.logger.log(`[Quote-Service] 🔍 findOneByTrimId 실행: "${identifier}"`);
    
    let query = {};
    const decodedName = decodeURIComponent(identifier);

    if (Types.ObjectId.isValid(identifier)) {
      const objectId = new Types.ObjectId(identifier);
      this.logger.log(`[Quote-Service]    👉 ObjectId 감지됨. ID로 검색합니다.`);
      query = {
        $or: [
          { 'trims._id': objectId },  
          { '_id': objectId }         
        ]
      };
    } else {
      this.logger.log(`[Quote-Service]    👉 문자열(String) 감지됨. 이름("${decodedName}")으로 검색합니다.`);
      query = { 'trims.trim_name': decodedName };
    }

    const vehicle = await this.vehicleModel.findOne(query).exec();

    if (!vehicle) {
      this.logger.warn(`[Quote-Service] ⚠️ 결과: NULL (데이터 없음)`);
      throw new NotFoundException(`해당 트림(${identifier}) 정보를 찾을 수 없습니다.`); 
    }

    this.logger.log(`[Quote-Service] 🎉 결과: 차량 찾음: ${vehicle.vehicle_name}`);
    return vehicle;
  }
  
  // 4. 비교견적용 다중 차량 조회 로직 (findManyByTrimIds)
  async findManyByTrimIds(identifiers: string[]): Promise<Vehicle[]> {
    if (!identifiers || identifiers.length === 0) return [];
    
    this.logger.log(`[Quote-Service] 🔍 findManyByTrimIds 실행: ${identifiers.length}개 ID 처리`);
    
    // findOneByTrimId를 재사용하여 유연한 검색을 병렬로 수행 (성공한 차량만 반환)
    const promises = identifiers.map(identifier => 
      this.findOneByTrimId(identifier).catch(e => {
        this.logger.error(`[Quote-Service] 개별 ID 조회 실패 (${identifier}): ${e.message}`);
        return null; 
      })
    );
    
    const vehicles = await Promise.all(promises);
    
    return vehicles.filter(v => v !== null);
  }
}
