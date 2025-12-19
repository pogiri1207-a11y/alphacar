// src/chat/chat.module.ts
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule, // 환경변수 사용을 위해 import
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
