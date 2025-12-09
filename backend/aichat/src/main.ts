import { setupTracing } from '../../tracing';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // OpenTelemetry 초기화 (가장 먼저 실행)
  const serviceName = process.env.SERVICE_NAME || 'aichat-backend';
  setupTracing(serviceName);

  const app = await NestFactory.create(AppModule);

  // ✅ [수정] CORS 설정: 실제 운영 중인 사이트 주소 허용
  app.enableCors({
    origin: [
      'https://192.168.0.160.nip.io:8000', // 팀 서버 주소 (HTTPS)
      'http://localhost:8000',             // 로컬 테스트용
      'http://127.0.0.1:8000'              // (혹시 몰라 추가)
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // ✅ 포트는 4000번 유지 (8000번과 겹치지 않게)
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`AIChat Service is running on port ${port}`);
}
bootstrap();
