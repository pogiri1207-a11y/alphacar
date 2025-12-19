import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 👇 [추가] CORS 설정: 프론트엔드에서의 접근을 허용
  app.enableCors({
    origin: true, // 모든 주소 허용 (개발용) 또는 특정 주소 'http://192.168.0.160.nip.io:8000'
    credentials: true,
  });

  await app.listen(3005);
}
bootstrap();
