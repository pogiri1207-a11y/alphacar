import { Controller, Get, Post, Param, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { VehicleService } from './vehicle.service';

@Controller('api/vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  // ==================================================================
  // [순서 중요] 동적 경로(:id)보다 구체적인 경로(history/...)가 위에 와야 함
  // ==================================================================

  // 1. [GET] 빨간 원(Badge) 개수 조회
  // 요청: GET /vehicles/history/count?userId=user_abc123
  @Get('history/count')
  async getCount(@Query('userId') userId: string) {
    // 유저 ID가 없으면 guest로 처리
    const finalUserId = userId || 'guest_user';
    
    const count = await this.vehicleService.getRecentCount(finalUserId);
    return { count };
  }

  // 2. [GET] 최근 본 차량 목록 조회
  // 요청: GET /vehicles/history/recent?userId=user_abc123
  @Get('history/recent')
  async getRecentViews(@Query('userId') userId: string) {
    const finalUserId = userId || 'guest_user';
    return await this.vehicleService.getRecentVehicles(finalUserId);
  }

  // 3. [POST] "나 이 차 봤어!" 저장 요청
  // 요청: POST /vehicles/{차량ID}/view  (Body: { userId: "user_abc123" })
  @Post(':id/view')
  async recordView(
    @Param('id') vehicleId: string, 
    @Body('userId') userId: string // ★ Body에서 userId를 꺼냄
  ) {
    const finalUserId = userId || 'guest_user';

    console.log(`📡 [요청 도착] 차량 클릭됨! ID: ${vehicleId}`);
    console.log(`👤 [유저 확인] 저장할 유저명: ${finalUserId}`);

    return await this.vehicleService.addRecentView(finalUserId, vehicleId);
  }

  // ==================================================================
    // [추가] 상세 견적 페이지 데이터 조회 (프론트엔드 요청 대응)
    // ==================================================================

    /**
     * 🚨 [신규 추가] GET /vehicles/detail?trimId=<trimId>
     * 프론트엔드의 fetch(`${API_BASE}/detail?trimId=${trimId}`) 요청을 처리합니다.
     */
    @Get('detail')
    async getVehicleDetailData(@Query('trimId') trimId: string) {
        if (!trimId) {
            // trimId가 없으면 유효한 400 Bad Request JSON 응답
            throw new HttpException('Trim ID가 쿼리 파라미터로 필요합니다.', HttpStatus.BAD_REQUEST);
        }

        // Service의 findOne 메서드는 이미 데이터가 없으면 NotFoundException을 던집니다.
        // Nest.js는 이 Exception을 404 Not Found JSON 응답으로 자동 변환해 줍니다.
        // 데이터가 있을 경우, vehicle.schema.ts의 toJSON 설정에 따라 trimId가 포함된
        // 유효한 JSON (200 OK)이 프론트엔드에 전달됩니다.
        return await this.vehicleService.findOne(trimId);
    }

  // ==================================================================
  // [기존] 범용 경로
  // ==================================================================

  // 4. [GET] 전체 조회
  @Get()
  async findAll() {
    return this.vehicleService.findAll();
  }

  // 5. [GET] 상세 조회
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.vehicleService.findOne(id);
  }
}
