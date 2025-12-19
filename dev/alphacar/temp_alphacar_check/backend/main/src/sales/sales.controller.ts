// src/sales/sales.controller.ts

import { Controller, Get, Post, Body } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSalesRankingDto } from './dto/create-sales-ranking.dto'; // 👈 import

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  // ✅ [추가됨] POST 방식: 몽고디비에 데이터 적재
  // 요청 주소: POST http://서버주소/sales/rankings
  @Post('rankings')
  async createRanking(@Body() createSalesRankingDto: CreateSalesRankingDto) {
    console.log(`[POST] 📝 데이터 적재 요청 도착: ${createSalesRankingDto.data_type} / ${createSalesRankingDto.year}-${createSalesRankingDto.month}`);
    return this.salesService.create(createSalesRankingDto);
  }

  // (기존 GET 방식 유지)
  @Get('rankings')
  async getRankings() {
    return this.salesService.getLatestRankings();
  }
}
