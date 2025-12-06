// kevin@devserver:~/alphacar/backend/quote/src/vehicles$ cat vehicles.controller.ts
import { Controller, Get, Query, Logger } from '@nestjs/common';
import { AppService } from '../app.service'; 

@Controller('vehicles') // 최종 경로: /vehicles
export class VehiclesController {
  private readonly logger = new Logger(VehiclesController.name);

  constructor(private readonly appService: AppService) {}

  /**
   * 개별 견적 상세 정보 조회 API 
   * @GET /vehicles/detail?trimId={vehicle_id}
   */
  @Get('detail')
  async getTrimDetail(@Query('trimId') trimId: string): Promise<any> {
    this.logger.log(`GET /vehicles/detail 요청 수신: Vehicle/Trim ID ${trimId}`);
    // trimId는 AppService에서 vehicle_id로 처리됩니다.
    return this.appService.getTrimDetail(trimId);
  }
  
  /**
   * 비교 견적 목록 조회 API
   * @GET /vehicles/compare-data?ids={id1},{id2}
   */
  @Get('compare-data')
  async getCompareData(@Query('ids') ids: string): Promise<any> {
    this.logger.log(`GET /vehicles/compare-data 요청 수신: IDs ${ids}`);
    return this.appService.getCompareData(ids);
  }
}
