// kevin@devserver:~/alphacar/backend/quote/src/estimate$ cat estimate.module.ts (수정)
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
// ✅ 경로 수정: '../schemas/estimate.schema' -> './schemas/estimate.schema'
import { Estimate, EstimateSchema } from './schemas/estimate.schema'; 
import { EstimateController } from './estimate.controller';
import { EstimateService } from './estimate.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Estimate.name, schema: EstimateSchema },
    ], 'estimate_conn'), 
  ],
  controllers: [EstimateController],
  providers: [EstimateService],
  exports: [EstimateService],
})
export class EstimateModule {}
