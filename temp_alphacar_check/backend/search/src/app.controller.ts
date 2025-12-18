import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('search')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async search(@Query('keyword') keyword: string) {
    // 빈 검색어 처리
    if (!keyword) {
      return {
        success: true,
        keyword: '',
        result: { cars: [], community: [] },
      };
    }

    const cars = await this.appService.searchCars(keyword);

    return {
      success: true,
      keyword,
      result: {
        cars: cars,
        community: [], // 커뮤니티 기능은 제외
      },
    };
  }
}
