// src/manufacturer.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ManufacturerDocument = Manufacturer & Document;

@Schema()
export class Manufacturer {
  @Prop({ required: true, unique: true })
  name: string; // 제조사 이름 (예: 현대, 기아)

  @Prop()
  country: string; // 제조국

  @Prop()
  logoUrl: string; // 로고 이미지 URL
}

export const ManufacturerSchema = SchemaFactory.createForClass(Manufacturer);
