// 1️⃣ [필수] Tracing 설정을 맨 위에서 import 합니다.
import { setupTracing } from './tracing';

// 2️⃣ [필수] bootstrap 함수 밖에서, 즉시 실행하여 NestJS 로딩 전에 Hooking 하도록 합니다.
const serviceName = process.env.SERVICE_NAME || 'community-backend';
setupTracing(serviceName);

// 3️⃣ 그 다음 NestJS 및 앱 관련 모듈을 import 합니다.
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Tracing은 이미 위에서 초기화되었습니다.

  const app = await NestFactory.create(AppModule);

  // 👇 [추가] CORS 설정: 프론트엔드에서의 접근을 허용
  app.enableCors({
    origin: true, // 요청한 Origin을 그대로 반환 (모두 허용과 유사)
    credentials: true,
  });

  const port = process.env.PORT || 3005;

  // ✅ [수정] 0.0.0.0을 명시해야 컨테이너 외부에서 접속 가능합니다.
  await app.listen(port, '0.0.0.0');
  
  console.log(`${serviceName} is running on port ${port}`);
}
bootstrap();
