// 1️⃣ [가장 중요] Tracing 설정을 맨 위에서 불러오고 '즉시 실행'합니다.
//import { setupTracing } from './tracing';

const serviceName = process.env.SERVICE_NAME || 'aichat-backend';
//setupTracing(serviceName);

// 2️⃣ 그 다음에 NestJS 관련 모듈을 임포트합니다.
// (순서가 바뀌면 Tracing이 HTTP 요청을 못 잡을 수 있습니다)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // 이미 위에서 Tracing이 켜졌으므로 여기서는 앱 생성만 하면 됩니다.
  const app = await NestFactory.create(AppModule);

  // ✅ CORS 설정 유지
  app.enableCors({
    origin: [
      'https://192.168.0.160.nip.io:8000',
      'http://localhost:8000',
      'http://127.0.0.1:8000'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // ✅ 포트 설정 유지
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`AIChat Service is running on port ${port}`);
}
bootstrap();
