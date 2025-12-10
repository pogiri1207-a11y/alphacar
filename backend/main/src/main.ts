// 1️⃣ [필수] Tracing 설정을 맨 위에서 불러오고 '즉시 실행'합니다.
import { setupTracing } from './tracing';

const serviceName = process.env.SERVICE_NAME || 'main-backend';
setupTracing(serviceName); 
// 👆 bootstrap 함수 밖에서, 다른 import보다 먼저 실행되어야 합니다!

// 2️⃣ 그 다음에 NestJS 관련 모듈을 임포트합니다.
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Tracing은 위에서 이미 켜졌습니다.
  
  const app = await NestFactory.create(AppModule);

  // ✅ CORS 설정: 모든 오리진 (*) 허용
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT || 3002;
  // 3. 서버 실행
  await app.listen(port, '0.0.0.0');
  console.log(`${serviceName} is running on port ${port}`);
}

bootstrap();
