// 1️⃣ [필수] Tracing 설정을 맨 위에서 import 합니다.
import { setupTracing } from './tracing';

// 2️⃣ [필수] bootstrap 함수 밖에서, 즉시 실행하여 NestJS 로딩 전에 Hooking 하도록 합니다.
const serviceName = process.env.SERVICE_NAME || 'quote-backend';
setupTracing(serviceName);

// 3️⃣ 그 다음 NestJS 및 앱 관련 모듈을 import 합니다.
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // Tracing은 이미 위에서 초기화되었습니다.

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

  // 3. 리스닝 인터페이스 수정
  await app.listen(3003, '0.0.0.0', () => {
      console.log(`\n\n[SERVER START] ${serviceName} listening on http://0.0.0.0:3003`);
      console.log(`[SERVER INFO] Global Prefix: /api`);
      console.log(`[SERVER TEST] HTTP URL: http://192.168.0.160.nip.io:3003/api/test-log`);
  });
}
bootstrap();
