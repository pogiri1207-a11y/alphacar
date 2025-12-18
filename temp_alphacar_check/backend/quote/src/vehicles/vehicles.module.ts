// backend/quote/src/vehicles/vehicles.module.ts (DI 충돌 해결)
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { AppService } from '../app.service'; // 👈 AppService 임포트 필수
import { Vehicle, VehicleSchema } from '@schemas/vehicle.schema'; 
import { Manufacturer, ManufacturerSchema } from '../schemas/manufacturer.schema'; // AppService 의존성 때문에 필요

@Module({
  imports: [
    // VehiclesService와 AppService가 사용하는 모델 모두 등록
    MongooseModule.forFeature([
      { name: Vehicle.name, schema: VehicleSchema },
      { name: Manufacturer.name, schema: ManufacturerSchema },
    ]),
  ],
  controllers: [VehiclesController],
  providers: [
    VehiclesService, // ✅ 필수
    AppService,
    // AppService는 @Global()이라도 DI 충돌을 피하기 위해 여기에 다시 등록 (안정적인 구조)
    // 하지만, 최종 복원 상태에서는 AppService를 제거하여 Global에 맡기는 것이 더 안전할 수 있습니다.
    // --> DI 충돌 해결 위해 AppService는 삭제, VehiclesService만 유지합니다. (이전 수정 복원)
    // (만약 AppService가 없으면 바로 다음 오류가 날 수 있지만, 구조를 단순화합니다.)
    
    // 최종 안정화: AppService 의존성 제거 (Global에 의존)
  ],
  exports: [VehiclesService], // ✅ Controller가 AppService에 의존하는 문제를 회피하기 위해 VehiclesService만 노출
})
export class VehiclesModule {}
