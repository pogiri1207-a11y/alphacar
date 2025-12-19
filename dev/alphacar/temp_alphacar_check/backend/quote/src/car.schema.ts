// backend/quote/src/car.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CarDocument = HydratedDocument<Car>;

@Schema() // 이 클래스가 데이터베이스 스키마임을 정의합니다.
export class Car {
  @Prop({ required: true }) // 필수 항목
  maker: string; // 제조사 (예: 현대)

  @Prop({ required: true })
  model: string; // 모델 (예: 아반떼)

  @Prop({ required: true })
  trim: string; // 트림 (예: 스마트)
}

export const CarSchema = SchemaFactory.createForClass(Car);
