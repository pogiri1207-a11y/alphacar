import { Controller, Get, Post, Param, Body, Query, HttpException, HttpStatus, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VehicleService } from './vehicle.service';
import { AppService } from './app.service';
import { Vehicle, VehicleDocument } from '../schemas/vehicle.schema';

// ✅ [복구] 다시 'vehicles'로 설정 (기존 규칙 준수)
@Controller('vehicles')
export class VehicleController {
  private readonly logger = new Logger(VehicleController.name);

  constructor(
    private readonly vehicleService: VehicleService,
    private readonly appService: AppService,
    @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
  ) {}

  // 1. [GET] 배지 카운트
  @Get('history/count')
  async getCount(@Query('userId') userId: string) {
    const finalUserId = userId || 'guest_user';
    return { count: await this.vehicleService.getRecentCount(finalUserId) };
  }

  // 2. [POST] 조회수 기록
  @Post(':id/view')
  async recordView(@Param('id') vehicleId: string, @Body('userId') userId: string) {
    const finalUserId = userId || 'guest_user';
    return await this.vehicleService.addRecentView(finalUserId, vehicleId);
  }

  // 3. [GET] 상세 조회 (견적용)
  @Get('detail')
  async getVehicleDetailData(@Query('trimId') trimId: string, @Query('modelName') modelName?: string) {
    console.log(`\n================================================`);
    console.log(`[Controller] 📨 상세 견적 요청 도착!`);
    console.log(`   👉 받은 trimId: "${trimId}"`);
    console.log(`   👉 받은 modelName: "${modelName || '없음'}"`);
    if (!trimId || trimId === 'undefined') {
      console.error(`[Controller] ❌ trimId가 없거나 undefined입니다.`);
      throw new NotFoundException('트림 ID가 유효하지 않습니다.');
    }
    try {
      const result = await this.vehicleService.findOneByTrimId(trimId, modelName);
      if (!result) {
        console.error(`[Controller] ❌ 데이터를 찾을 수 없습니다: ${trimId}`);
        throw new NotFoundException(`해당 트림(${trimId}) 정보를 찾을 수 없습니다.`);
      }
      console.log(`[Controller] ✅ 데이터 조회 성공. 응답을 보냅니다.`);
      return result;
    } catch (error) {
      console.error(`[Controller] 🚨 서비스 로직 에러:`, error.message);
      throw error;
    }
  }

  // 4. [GET] 전체 조회
  @Get()
  async findAll() { return this.vehicleService.findAll(); }

  // 5. [GET] 단일 조회
  @Get(':id')
  async findOne(@Param('id') id: string) { return this.vehicleService.findOne(id); }

  // 6. [GET] 제조사 목록 조회 (GET /vehicles/makers) - 견적 페이지용
  @Get('makers')
  async getMakers() {
    this.logger.log('🔍 [GET /vehicles/makers] 제조사 목록 조회 요청');
    try {
      const result = await this.appService.findAllMakers();
      this.logger.log(`✅ [GET /vehicles/makers] 성공: ${Array.isArray(result) ? result.length : 0}개 제조사`);
      return result;
    } catch (error) {
      this.logger.error(`❌ [GET /vehicles/makers] 에러:`, error);
      throw error;
    }
  }

  // 7. [GET] 차종 목록 조회 (GET /vehicles/models?makerId=xxx) - 견적 페이지용
  @Get('models')
  async getModels(@Query('makerId') makerId: string) {
    this.logger.log(`🔍 [GET /vehicles/models] 차종 목록 조회 요청 - makerId: ${makerId}`);
    try {
      const result = await this.appService.getModelsByMaker(makerId);
      this.logger.log(`✅ [GET /vehicles/models] 성공: ${Array.isArray(result) ? result.length : 0}개 차종`);
      return result;
    } catch (error) {
      this.logger.error(`❌ [GET /vehicles/models] 에러:`, error);
      throw error;
    }
  }

  // 8. [GET] 기본 트림 목록 조회 (GET /vehicles/base-trims?modelId=xxx) - 견적 페이지용
  @Get('base-trims')
  async getBaseTrims(@Query('modelId') modelId: string): Promise<any[]> {
    this.logger.log(`🔍 [GET /vehicles/base-trims] 기본 트림 목록 조회 요청 - modelId: ${modelId}`);
    try {
      const mongoose = require('mongoose');
      let query: any = {};
      
      if (mongoose.Types.ObjectId.isValid(modelId)) {
        query._id = new mongoose.Types.ObjectId(modelId);
      } else {
        query.vehicle_name = modelId;
      }
      
      const vehicles = await this.vehicleModel.find(query).exec();
      this.logger.log(`📦 [GET /vehicles/base-trims] 조회된 차량 수: ${vehicles.length}`);
      
      const baseTrimMap = new Map();
      
      vehicles.forEach((vehicle: any) => {
        const baseTrimName = vehicle.base_trim_name;
        if (baseTrimName && !baseTrimMap.has(baseTrimName)) {
          baseTrimMap.set(baseTrimName, {
            _id: vehicle._id || modelId,
            name: baseTrimName,
            base_trim_name: baseTrimName,
          });
        }
      });
      
      const result = Array.from(baseTrimMap.values());
      this.logger.log(`✅ [GET /vehicles/base-trims] 성공: ${result.length}개 기본 트림`);
      return result;
    } catch (error) {
      this.logger.error(`❌ [GET /vehicles/base-trims] 에러:`, error);
      throw error;
    }
  }

  // 9. [GET] 세부 트림 목록 조회 (GET /vehicles/trims?modelId=xxx) - 견적 페이지용
  @Get('trims')
  async getTrims(@Query('modelId') modelId: string) {
    this.logger.log(`🔍 [GET /vehicles/trims] 세부 트림 목록 조회 요청 - modelId: ${modelId}`);
    try {
      const result = await this.appService.getTrims(modelId);
      this.logger.log(`✅ [GET /vehicles/trims] 성공: ${Array.isArray(result) ? result.length : 0}개 세부 트림`);
      return result;
    } catch (error) {
      this.logger.error(`❌ [GET /vehicles/trims] 에러:`, error);
      throw error;
    }
  }
}
