// kevin@devserver:~/alphacar/backend/quote/src$ cat main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // 디버그 로그 레벨을 명시적으로 활성화합니다.
  const app = await NestFactory.create(AppModule, { 
      logger: ['error', 'warn', 'log', 'debug', 'verbose'], 
  });

  // 1. API 접두사 설정: 프론트엔드의 /api/ 호출에 맞춥니다.
  app.setGlobalPrefix('api'); 

  // 2. CORS 설정: 모든 오리진 (*) 허용
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
    
  // DTO 유효성 검사 파이프를 전역으로 적용합니다.
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // 3. 리스닝 인터페이스 수정: 3003 포트에서 '0.0.0.0' (외부 접속 허용) 리스닝
  // 이 포트와 프로토콜이 프론트엔드의 API_BASE와 일치해야 합니다.
  await app.listen(3003, '0.0.0.0', () => {
      console.log(`\n\n[SERVER START] NestJS Application listening on http://0.0.0.0:3003`);
      console.log(`[SERVER INFO] Global Prefix: /api`);
      console.log(`[SERVER TEST] HTTP URL: http://192.168.0.160.nip.io:3003/api/test-log`);
  });
}
bootstrap();
