// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    // FE 주소 허용 (다른 컴퓨터에서 접속하므로 IP 사용)
    origin: ['https://192.168.0.160', 'https://192.168.0.160:8000', 'http://192.168.0.160:8000', 'https://192.168.0.160.nip.io:8000'], 
    credentials: true,
  });

  // 3006 포트로 열고 0.0.0.0 바인딩 (IP 접속 문제 해결)
  await app.listen(3006, '0.0.0.0'); 
  console.log(`MyPage Service is running on port 3006`);
}
bootstrap();
