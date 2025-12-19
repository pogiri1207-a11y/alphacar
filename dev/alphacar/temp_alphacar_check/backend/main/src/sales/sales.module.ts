// src/sales/sales.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { SalesRanking, SalesRankingSchema } from './schemas/sales-ranking.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SalesRanking.name, schema: SalesRankingSchema },
    ]),
  ],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
