import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { RedisService } from './redis/redis.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly redisService: RedisService,
  ) {}

  // 1. 기본 루트 (Health Check용) - 단순 헬스 체크
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // 2. 메인 페이지 데이터 (GET /main)
  // ★ [수정] 프론트엔드가 /api/main을 호출하면 이 함수가 실행됩니다.
  // 기존 @Get()에 있던 '배너 + 최근 본 차량 + 차량 목록' 로직을 여기로 합쳤습니다.
  @Get('main')
  async getMainData(
    @Query('userId') userId: string = 'guest_id',
    @Query('brand') brand?: string
  ) {
    // (1) 서비스에서 차량 목록 가져오기 (브랜드 필터링 지원)
    const carList = await this.appService.getCarList(brand);

    // (2) Redis에서 최근 본 차량 ID 목록 가져오기
    const recentViewIds = await this.redisService.getRecentViews(userId);

    // (3) 종합 데이터 반환 (프론트엔드 MainData 타입과 일치)
    return {
      welcomeMessage: 'Welcome to AlphaCar Home',
      searchBar: {
        isShow: true,
        placeholder: '찾는 차량을 검색해 주세요'
      },
      banners: [
        { id: 1, text: '11월의 핫딜: 아반떼 즉시 출고', color: '#ff5555' },
        { id: 2, text: '겨울철 타이어 교체 가이드', color: '#5555ff' }
      ],
      shortcuts: ['견적내기', '시승신청', '이벤트'],
      
      // 차량 목록
      cars: carList,

      // 최근 본 차량 ID 목록
      recentViews: recentViewIds
    };
  }

  // 3. 차량 목록만 별도로 조회 (GET /cars) - 브랜드 필터링 지원
  @Get('cars')
  async getCarList(@Query('brand') brand?: string) {
    return await this.appService.getCarList(brand);
  }

  // 4. 최근 본 차량 기록 (POST /log-view/:id)
  @Post('log-view/:id')
  async logView(
    @Param('id') vehicleId: string,
    @Body('userId') userId: string
  ) {
    if (!userId) {
      return { success: false, message: 'User ID is required' };
    }

    // Redis에 기록
    await this.redisService.addRecentView(userId, vehicleId);
    return { success: true, message: 'Recent view logged successfully' };
  }

  // 5. 제조사 목록 조회 (GET /makers)
  @Get('makers')
  async getMakers() {
    return this.appService.findAllMakers();
  }

  // 6. 브랜드 목록 조회 (GET /brands) - logo_url 포함
  @Get('brands')
  async getBrands() {
    return this.appService.getBrandsWithLogo();
  }

  // 7. 브랜드 목록 조회 (GET /makers-with-logo) - logo_url 포함 (프론트엔드 호환성)
  @Get('makers-with-logo')
  async getMakersWithLogo() {
    return this.appService.getBrandsWithLogo();
  }

  @Get('models')
  async getModels(@Query('makerId') makerId: string) {
    return this.appService.getModelsByMaker(makerId);
  }

  @Get('trims')
  async getTrims(@Query('modelId') modelId: string) {
    return this.appService.getTrims(modelId);
  }

  // 8. 리뷰 분석 데이터 조회 (GET /review-analysis)
  @Get('review-analysis')
  async getReviewAnalysis(@Query('vehicleName') vehicleName: string) {
    return this.appService.getReviewAnalysis(vehicleName);
  }

}
