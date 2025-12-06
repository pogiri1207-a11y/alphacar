// kevin@devserver:~/alphacar/backend/main/src/redis/redis.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly client: Redis;

  constructor(private configService: ConfigService) {
    const password = this.configService.get<string>('REDIS_PASSWORD');
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST') || '127.0.0.1', // 기본값 추가
      port: this.configService.get<number>('REDIS_PORT') || 6379,
      password: password ? password : undefined,
    });
  }

  getClient(): Redis {
    return this.client;
  }

  // [기능 1] 최근 본 차량 저장 (ZSET 사용)
  async addRecentView(userId: string, vehicleId: string): Promise<void> {
    const key = `recent_views:${userId}`;
    const score = Date.now(); 

    // 이미 있으면 점수(시간)만 업데이트, 없으면 추가
    await this.client.zadd(key, score, vehicleId);

    // 최신 10개 유지 (오래된 것 삭제)
    const count = await this.client.zcard(key);
    if (count > 10) {
      // 점수(시간)가 낮은 순으로 삭제
      await this.client.zremrangebyrank(key, 0, count - 11);
    }

    await this.client.expire(key, 60 * 60 * 24); // 1일 유지
    console.log(`[Main-Redis] Added history: User=${userId}, Vehicle=${vehicleId}`);
  }

  // [기능 2] 목록 조회
  async getRecentViews(userId: string): Promise<string[]> {
    const key = `recent_views:${userId}`;
    return await this.client.zrevrange(key, 0, -1);
  }

  // ✅ [기능 3] 개수 조회 (새로 추가)
  async getHistoryCount(userId: string): Promise<number> {
    const key = `recent_views:${userId}`;
    return await this.client.zcard(key);
  }
}
