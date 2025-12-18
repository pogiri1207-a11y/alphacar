// backend/community/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommunityPost } from './entities/community-post.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mariadb',
        host: config.get<string>('MARIADB_HOST'),
        port: config.get<number>('MARIADB_PORT'),
        username: config.get<string>('MARIADB_USERNAME'),
        password: config.get<string>('MARIADB_PASSWORD'),
        database: config.get<string>('MARIADB_DATABASE'),
	charset: 'utf8mb4',
	entities: [CommunityPost],
        synchronize: config.get<string>('NODE_ENV') !== 'production', // 프로덕션에서는 false
        logging: true,
      }),
    }),
    // 👇 서비스에서 Board Repository를 쓰기 위해 필수 등록
    TypeOrmModule.forFeature([CommunityPost]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
