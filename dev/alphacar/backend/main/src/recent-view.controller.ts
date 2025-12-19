import { Controller, Get, Query, Logger } from '@nestjs/common';
import { VehicleService } from './vehicle.service';

// ✅ [신규] 최근 본 차량 전용 컨트롤러 (Nginx 라우팅 문제 해결용)
// 최종 주소: /api/recent-cars -> (HAProxy) -> /recent-cars
@Controller('recent-views')
export class RecentViewController {
  private readonly logger = new Logger(RecentViewController.name);

  constructor(private readonly vehicleService: VehicleService) {}

  @Get()
  async getRecentViewsPage(@Query('userId') userId: string) {
    this.logger.log(`🔍 [RecentView] GET /recent-cars 요청 도착! (User: ${userId})`);
    
    if (!userId) return [];

    try {
        const results = await this.vehicleService.getRecentVehicles(userId);
        this.logger.log(`✅ [RecentView] 조회 성공: ${results.length}건`);
        return results;
    } catch (e) {
        this.logger.error(`❌ [RecentView] 에러: ${e.message}`);
        return [];
    }
  }
}
