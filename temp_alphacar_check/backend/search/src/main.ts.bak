import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. 상세 CORS 설정 적용 (User 요청 사항 반영)
  app.enableCors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // 2. 검색 서비스 포트: 3007번으로 변경
  await app.listen(3007);
  console.log(`Search Service is running on port 3007`);
}
bootstrap();
