import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // MongoDB 연결 (기존)
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        uri: `mongodb://${config.get('DATABASE_USER')}:${config.get('DATABASE_PASSWORD')}@${config.get('DATABASE_HOST')}:${config.get('DATABASE_PORT')}/${config.get('DATABASE_NAME')}?authSource=admin`,
      }),
      inject: [ConfigService],
    }),
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
