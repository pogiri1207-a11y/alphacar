import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Vehicle } from './vehicle.schema';
import { RedisService } from './redis/redis.service';

@Injectable()
export class VehicleService {
  constructor(
    @InjectModel(Vehicle.name) private vehicleModel: Model<Vehicle>,
    private readonly redisService: RedisService
  ) {}

  // [기존 기능 유지] 전체 차량 조회
  async findAll(): Promise<Vehicle[]> {
    const results = await this.vehicleModel.find().exec();
    return results;
  }

  // [기존 기능 유지] 특정 차량 상세 조회
//  async findOne(id: string): Promise<Vehicle> {
//    const vehicle = await this.vehicleModel.findById(id).exec();
//    if (!vehicle) {
//      throw new NotFoundException(`ID가 ${id}인 차량을 찾을 수 없습니다.`);
//    }
//    return vehicle;
//  }

// 🚨 [최종 수정] 특정 차량 상세 조회 (DB 오류 안전망 추가)
    async findOne(id: string): Promise<Vehicle> {
        
        // 1. ID 형식 유효성 검사 (기존 유지)
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(`요청된 차량 ID '${id}'의 형식이 유효하지 않습니다.`);
        }

        try {
            // 2. 🚨 DB 쿼리를 try...catch로 감싸서 Mongoose 오류를 방지
            const vehicle = await this.vehicleModel.findById(id).exec();
            
            if (!vehicle) {
                // 차량을 찾지 못하면 404 Not Found 에러 반환
                throw new NotFoundException(`ID가 ${id}인 차량을 찾을 수 없습니다.`);
            }
            
            return vehicle;
            
        } catch (error) {
            // Mongoose 오류가 아닌 NestJS HttpException은 다시 던져서 NestJS가 처리하도록 함
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            
            // 3. 🚨 Mongoose나 기타 예상치 못한 DB 연결 오류 발생 시 500 에러 반환
            console.error(`[DB ERROR] ID ${id} 조회 중 치명적인 Mongoose 오류 발생:`, error.message);
            throw new InternalServerErrorException('데이터베이스 조회 중 서버 내부 오류가 발생했습니다.');
        }
    }

  // ==========================================================
  // [수정 및 추가된 기능] Redis 관련 로직
  // ==========================================================

  // 1. [수정] 최근 본 차량 저장 후 '현재 개수' 반환 (프론트엔드 빨간 원 업데이트용)
  async addRecentView(userId: string, vehicleId: string) {
    // (1) RedisService를 통해 저장
    await this.redisService.addRecentView(userId, vehicleId);
    
    // (2) 저장 후, 현재 몇 개인지 바로 세어서 가져옴
    const count = await this.getRecentCount(userId);

    // (3) 성공 여부와 개수를 함께 반환
    return { success: true, count };
  }

  // 2. [추가] 읽은 차량 개수만 빠르게 조회 (페이지 접속 시 빨간 원 표시용)
  async getRecentCount(userId: string): Promise<number> {
    // Redis 클라이언트를 가져와서 직접 명령어를 사용
    // 주의: RedisService에 getClient() 메서드가 있어야 합니다.
    const client = this.redisService.getClient();
    const key = `recent_views:${userId}`;
    
    // zcard: 저장된 리스트의 개수를 세는 Redis 명령어
    return await client.zcard(key);
  }

  // 3. [기존 기능 유지] 최근 본 차량 목록 가져오기
  async getRecentVehicles(userId: string): Promise<Vehicle[]> {
    const vehicleIds = await this.redisService.getRecentViews(userId);

    if (!vehicleIds || vehicleIds.length === 0) {
      return [];
    }

    const vehicles = await this.vehicleModel.find({
      _id: { $in: vehicleIds }
    }).exec();

    // Redis 순서(최신순)대로 정렬
    const sortedVehicles = vehicleIds
      .map(id => vehicles.find(v => v._id.toString() === id))
      .filter(v => v !== undefined) as Vehicle[];

    return sortedVehicles;
  }
}
