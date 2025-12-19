// 1️⃣ [필수] Tracing 설정을 맨 위에서 import 합니다.
import { setupTracing } from './tracing';

// 2️⃣ [필수] bootstrap 함수 밖에서, 즉시 실행하여 NestJS 로딩 전에 Hooking 하도록 합니다.
const serviceName = process.env.SERVICE_NAME || 'mypage-backend';
setupTracing(serviceName);

// 3️⃣ 그 다음 NestJS 및 앱 관련 모듈을 import 합니다.
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Tracing은 이미 위에서 초기화되었습니다.

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    // FE 주소 허용 (작성해주신 목록 유지)
    origin: [
      'https://192.168.0.160',
      'https://192.168.0.160:8000', 
      'http://192.168.0.160:8000', 
      'https://192.168.0.160.nip.io:8000'
    ],
    credentials: true,
  });

  const port = process.env.PORT || 3006;

  // 3006 포트로 열고 0.0.0.0 바인딩 (IP 접속 문제 해결)
  await app.listen(port, '0.0.0.0');
  
  console.log(`${serviceName} is running on port ${port}`);
}
bootstrap();
