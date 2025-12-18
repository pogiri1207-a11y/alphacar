// kevin@devserver:~/alphacar/backend/quote/src/vehicles$ cat vehicles.module.ts
import { Module } from '@nestjs/common';
import { VehiclesController } from './vehicles.controller';
import { AppService } from '../app.service';

@Module({
  imports: [],
  controllers: [VehiclesController],
  // AppService의 기능을 사용하기 위해 providers에 추가
  providers: [AppService] 
})
export class VehiclesModule {}
