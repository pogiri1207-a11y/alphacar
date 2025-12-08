// backend/main/src/app.module.ts

import { Module, NestModule, MiddlewareConsumer, Logger, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { RecentViewController } from './recent-view.controller';

// [수정 1] 경로 변경: ./vehicle.schema -> ../schemas/vehicle.schema
import { Vehicle, VehicleSchema } from '../schemas/vehicle.schema';
// Manufacturer는 아직 공통으로 안 뺐다면 그대로 유지, 뺐다면 경로 수정 필요
import { Manufacturer, ManufacturerSchema } from './manufacturer.schema';
import { ReviewAnalysis, ReviewAnalysisSchema } from './review-analysis.schema';

import { RedisModule } from './redis/redis.module';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';

import { SalesModule } from './sales/sales.module';

import { FavoritesModule } from './favorites/favorites.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        uri: `mongodb://${config.get('DATABASE_USER')}:${config.get('DATABASE_PASSWORD')}@${config.get('DATABASE_HOST')}:${config.get('DATABASE_PORT')}/${config.get('DATABASE_NAME')}?authSource=admin`,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Vehicle.name, schema: VehicleSchema },
      { name: Manufacturer.name, schema: ManufacturerSchema },
      { name: ReviewAnalysis.name, schema: ReviewAnalysisSchema },
    ]),
    RedisModule,
    SalesModule,
    FavoritesModule,
  ],
  controllers: [AppController, VehicleController, RecentViewController],
  providers: [AppService, VehicleService],
})
export class AppModule implements NestModule {
  private readonly logger = new Logger('HTTP');

  // 🚨 [추가] 모든 요청을 가로채서 로그를 찍는 미들웨어
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req, res, next) => {
	console.log(`\n================================`);
        console.log(`[1] 🚀 REQUEST RECEIVED`);
        console.log(`Method: ${req.method}`);
        console.log(`Original URL: ${req.originalUrl}`); // 사용자가 보낸 원본 URL
        console.log(`Path: ${req.path}`);       // 실제 처리되는 경로
        console.log(`================================\n`);
        next();
      })
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
