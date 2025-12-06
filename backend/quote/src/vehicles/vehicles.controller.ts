// kevin@devserver:~/alphacar/backend/quote/src/vehicles$ cat vehicles.controller.ts
import { Controller, Get, Query, Logger, HttpStatus, UsePipes } from '@nestjs/common';
import { AppService } from '../app.service'; 

// ✅ 모든 데이터 조회 경로를 /vehicles 로 통합
@Controller('vehicles') 
export class VehiclesController {
    private readonly logger = new Logger(VehiclesController.name);

    constructor(private readonly appService: AppService) {
        console.log('--- VehiclesController 초기화 완료 ---'); 
    }

    // 1. 제조사 목록 조회 (경로: /vehicles/makers)
    @Get('makers')
    @UsePipes()
    getMakers() {
        this.logger.log(`[REQ] GET /vehicles/makers 요청 수신`);
        return this.appService.getManufacturers();
    }

    // 2. 모델 목록 조회 (경로: /vehicles/models)
    @Get('models')
    getModels(@Query('makerId') makerId: string) {
        this.logger.log(`[REQ] GET /vehicles/models 요청 수신`);
        return this.appService.getModelsByManufacturer(makerId);
    }

    // 3. 트림 목록 조회 (경로: /vehicles/trims)
    @Get('trims')
    getTrims(@Query('modelId') modelId: string) {
        this.logger.log(`[REQ] GET /vehicles/trims 요청 수신`);
        if (!modelId || modelId === 'undefined') {
            return [];
        }
        return this.appService.getTrimsByModel(modelId);
    }
    
    // 4. 상세 결과 조회 (경로: /vehicles/detail)
    @Get('detail')
    async getTrimDetail(@Query('trimId') trimId: string): Promise<any> {
        console.log(`--- VehiclesController: /detail 라우트 도달 (ID: ${trimId}) ---`); 
        this.logger.log(`[REQ] GET /vehicles/detail 요청 수신: trimId=${trimId}`);
        return this.appService.getTrimDetail(trimId);
    }

    // 5. 비교 데이터 조회 API (경로: /vehicles/compare-data)
    @Get('compare-data')
    getCompareData(@Query('ids') ids: string) {
        console.log(`--- VehiclesController: /compare-data 라우트 도달 (IDs: ${ids}) ---`);
        this.logger.log(`[REQ] GET /vehicles/compare-data 요청 수신: ids=${ids}`);
        return this.appService.getCompareData(ids);
    }
    
    // 6. 비교 견적 상세 정보 조회 API (경로: /vehicles/compare-details)
    @Get('compare-details')
    async getCompareDetails(
      @Query('trimId') trimId: string,
      @Query('options') optionsString: string,
    ) {
        if (!trimId) {
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'trimId(트림 ID)는 필수입니다.',
            };
        }

        const optionIds = optionsString
            ? optionsString.split(',').filter((id) => id.trim() !== '')
            : [];

        return await this.appService.getCompareDetails(trimId, optionIds);
    }
}
