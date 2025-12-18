// kevin@devserver:~/alphacar/backend/main/src/redis/redis.module.ts
import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisController } from './redis.controller'; // Controller 추가
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [RedisController], // 등록 확인
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
