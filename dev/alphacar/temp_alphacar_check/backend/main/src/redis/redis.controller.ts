// kevin@devserver:~/alphacar/backend/main/src/redis/redis.controller.ts
import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { RedisService } from './redis.service';

@Controller('history') // 경로는 /api/history 가 됨 (Main 서버 기준)
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  // 1. 기록 저장: POST /api/history
  @Post()
  async addHistory(@Body() body: { userId: string; vehicleId: string }) {
    await this.redisService.addRecentView(body.userId, body.vehicleId);
    return { success: true };
  }

  // 2. 개수 조회: GET /api/history/count
  @Get('count')
  async getCount(@Query('userId') userId: string) {
    const count = await this.redisService.getHistoryCount(userId);
    return { count };
  }
}
