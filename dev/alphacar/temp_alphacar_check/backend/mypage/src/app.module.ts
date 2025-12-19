// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module'; 
import { AuthController } from './auth/auth.controller'; 
import { User } from './entities/user.entity';

import { AppController } from './app.controller'; // 👈 [추가]
import { AppService } from './app.service';     // 👈 [추가]

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // MariaDB 연결 설정 (환경 변수 사용)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'mariadb',
        host: config.get<string>('MARIADB_HOST'),
        port: config.get<number>('MARIADB_PORT') || 15432,
        username: config.get<string>('MARIADB_USERNAME') || 'team1',
        password: config.get<string>('MARIADB_PASSWORD'),
        database: config.get<string>('MARIADB_DATABASE') || 'team1',
        entities: [User],
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    AuthModule, 
    
    // 👇 [핵심 수정] AppService가 사용하는 User 엔티티의 Repository를 등록합니다.
    TypeOrmModule.forFeature([User]), 
  ],
  // 👇 [수정] AppController를 등록하여 /mypage 경로를 활성화
  controllers: [AppController, AuthController], 
  // 👇 [수정] AppController가 사용하는 AppService를 등록
  providers: [AppService], 
})
export class AppModule {}
