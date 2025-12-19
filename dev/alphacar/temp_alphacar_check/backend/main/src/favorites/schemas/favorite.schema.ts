// src/favorites/schemas/favorite.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Vehicle } from '../../../schemas/vehicle.schema'; // 기존 Vehicle 스키마 경로 확인 필요

@Schema({ collection: 'favorites' })
export class Favorite extends Document {
  @Prop({ required: true })
  userId: string; // 로컬스토리지의 user_id 저장

  @Prop({ type: Types.ObjectId, ref: 'Vehicle', required: true })
  vehicleId: Types.ObjectId; // 차량 ID (ObjectId)

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);
// 중복 찜 방지를 위해 복합 인덱스 설정 (한 유저가 같은 차를 두 번 찜할 수 없음)
FavoriteSchema.index({ userId: 1, vehicleId: 1 }, { unique: true });
