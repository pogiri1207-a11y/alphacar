// src/main.ts (모든 NestJS 프로젝트에 적용)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ CORS 설정: 모든 오리진 (*) 허용
  app.enableCors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  const port = process.env.PORT || 3002;
  // 포트 번호는 각 프로젝트에 맞게 유지 (3002, 3003, 3004 등)
  await app.listen(3002, '0.0.0.0');
  // 3. 서버 실행
  console.log(`🚀 서버가 포트 ${port}에서 실행 중입니다!`); 
}
bootstrap();
