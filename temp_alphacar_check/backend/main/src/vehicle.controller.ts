import { Controller, Get, Post, Param, Body, Query, HttpException, HttpStatus, Logger, NotFoundException } from '@nestjs/common';
import { VehicleService } from './vehicle.service';

// ✅ [복구] 다시 'vehicles'로 설정 (기존 규칙 준수)
@Controller('vehicles')
export class VehicleController {
  private readonly logger = new Logger(VehicleController.name);

  constructor(private readonly vehicleService: VehicleService) {}

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
}
