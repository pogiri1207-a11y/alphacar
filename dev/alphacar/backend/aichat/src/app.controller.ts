import { Controller, Post, Body, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('aichat') // 기본 주소: /aichat
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 헬스체크 엔드포인트
  @Get()
  health() {
    return {
      status: 'ok',
      service: 'aichat-backend',
      timestamp: new Date().toISOString()
    };
  }

  // POST http://localhost:3008/aichat
  @Post()
  chat(@Body() body: any) {
    const userMessage = body.message || '';
    let aiReply = '죄송합니다. 제가 이해할 수 없는 말이에요.';

    // 간단한 키워드 응답 로직 (나중에 OpenAI API 등으로 교체 가능)
    if (userMessage.includes('안녕')) {
      aiReply = '안녕하세요! AlphaCar AI 챗봇입니다. 무엇을 도와드릴까요?';
    } else if (userMessage.includes('견적')) {
      aiReply = '견적 비교는 상단 메뉴의 [견적 비교] 탭에서 가능합니다!';
    } else if (userMessage.includes('추천')) {
      aiReply = '고객님께 딱 맞는 차를 추천해 드릴게요. 선호하는 브랜드를 알려주세요.';
    }

    return {
      success: true,
      reply: aiReply,
      timestamp: new Date().toISOString()
    };
  }
}
