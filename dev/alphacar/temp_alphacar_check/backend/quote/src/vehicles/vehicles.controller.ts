import { Controller, Get, Param, Query, Logger, HttpStatus, NotFoundException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AppService } from '../app.service';
import { VehiclesService } from './vehicles.service'; 

@Controller('vehicles')
export class VehiclesController {
  private readonly logger = new Logger(VehiclesController.name);

  constructor(
    private readonly appService: AppService,
    private readonly vehiclesService: VehiclesService // VehiclesService 주입
  ) {
    console.log('--- VehiclesController 초기화 완료 ---');
  }

  // 1. 제조사 목록
  @Get('makers')
  getMakers() {
    this.logger.log(`[REQ] GET /vehicles/makers 요청 수신`);
    return this.appService.getManufacturers();
  }

  // 2. 모델 목록
  @Get('models')
  getModels(@Query('makerId') makerId: string) {
    this.logger.log(`[REQ] GET /vehicles/models 요청 수신`);
    return this.appService.getModelsByManufacturer(makerId);
  }

  // 3. 기본 트림 목록 (4단계 필터링용)
  @Get('base-trims')
  getBaseTrims(
    @Query('modelId') modelId: string,
    @Query('vehicleId') vehicleId: string
  ) {
    const targetId = modelId || vehicleId;
    this.logger.log(`[REQ] GET /vehicles/base-trims 요청 수신 (ID: ${targetId})`);

    if (!targetId || targetId === 'undefined') {
      this.logger.warn(`❌ ID가 전달되지 않았습니다.`);
      return [];
    }

    return this.appService.getBaseTrimsByModel(targetId);
  }

  // 4. 세부 트림 목록
  @Get('trims')
  getTrims(
    @Query('modelId') modelId: string,
    @Query('vehicleId') vehicleId: string
  ) {
    const targetId = modelId || vehicleId;
    this.logger.log(`[REQ] GET /vehicles/trims 요청 수신 (ID: ${targetId})`);

    if (!targetId || targetId === 'undefined') {
      this.logger.warn(`❌ ID가 전달되지 않았습니다.`);
      return [];
    }

    return this.appService.getTrimsByModel(targetId);
  }

  // 5. 상세 결과 조회 (Flexible Search)
  @Get('detail')
  async getTrimDetail(@Query('trimId') trimId: string) {
    this.logger.log(`[REQ] GET /vehicles/detail 요청 수신: trimId=${trimId}`);
    
    this.logger.log(`[DEBUG CALL] Calling VehiclesService.findOneByTrimId with: ${trimId}`); 
    
    return this.vehiclesService.findOneByTrimId(trimId);
  }
  
  // 6. [신규 구현] 비교 데이터 (다중 차량 조회)
  @Get('compare-data')
  async getCompareData(@Query('ids') ids: string) {
    this.logger.log(`[REQ] GET /vehicles/compare-data 요청 수신: ids=${ids}`);
    if (!ids) return [];
    
    const identifiers = ids.split(',').filter(id => id.trim() !== '');
    
    // 다중 조회 함수 호출
    return this.vehiclesService.findManyByTrimIds(identifiers);
  }

  // 7. 비교 견적 상세
  @UseGuards(JwtAuthGuard)
  @Get('compare-details')
  async getCompareDetails(
    @Query('trimId') trimId: string,
    @Query('options') optionsString: string,
  ) {
    if (!trimId) throw new NotFoundException('trimId 필수');
    const optionIds = optionsString ? optionsString.split(',').filter(id => id.trim() !== '') : [];
    // AppService의 기존 비교 로직 호출
    return await this.appService.getCompareDetails(trimId, optionIds);
  }
  
  // 8. 특정 차량 조회 (ID 전용)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`[REQ] GET /vehicles/:id 요청 수신: id=${id}`);
    return this.vehiclesService.findOne(id);
  }
}
