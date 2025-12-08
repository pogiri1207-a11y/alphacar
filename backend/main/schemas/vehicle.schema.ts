import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Types } from 'mongoose';

// ==========================================================
// 1. 중첩 스키마: Trim (트림 정보)
// ==========================================================

// [수정] _id 필드를 추가하여, 트림 객체가 MongoDB에 저장될 때 _id를 갖도록 보장합니다.
@Schema({ _id: true }) 
class Trim {
  // MongoDB가 ObjectId를 할당하도록 명시적으로 설정
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  _id: Types.ObjectId; 

  @Prop({ required: true })
  trim_name: string; // 기존 DB 필드명에 맞춰 trim_name 사용

  @Prop({ required: true })
  price: number; 
  
  @Prop()
  price_formatted?: string; // 기존 DB 데이터 지원 필드
  
  // 기존 DB에 있던 trim_name 필드 중복 정의를 제거하고, DTO/Mongoose의 trim_name을 따릅니다.
  // @Prop()
  // trim_name?: string; 
}

export const TrimSchema = SchemaFactory.createForClass(Trim);

// ==========================================================
// 2. 메인 스키마: Vehicle
// ==========================================================

export type VehicleDocument = Vehicle & Document;

@Schema({
  collection: 'danawa_vehicle_data',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})
export class Vehicle {
  // --- 신규/핵심 필드 ---
  @Prop({ required: true })
  brand_name: string; 

  @Prop({ required: true })
  vehicle_name: string; 
  
  @Prop({ type: [TrimSchema] })
  trims: Trim[]; 

  @Prop()
  main_image: string; // 신규 메인 이미지 URL

  // --- 기존 DB 호환성 필드 (모두 Optional 처리) ---
  
  @Prop()
  name?: string; // 기존 DB 데이터의 'name' 필드 지원

  @Prop()
  year?: number; // DB 필드가 model_year로 존재하지만, 스키마에는 year로 정의 (호환성을 위해 Optional)

  @Prop()
  price?: number; // 차량 기본 가격 필드 (필요시 사용)

  @Prop()
  color?: string; // 단일 색상 필드

  @Prop()
  options?: string[]; // 단일 옵션 목록 (또는 옵션 객체 배열을 위한 공간)
  
  @Prop()
  min_price?: number; // 기존 DB 데이터의 'min_price' 필드 지원

  @Prop()
  image_url?: string; // 기존 DB 데이터의 'image_url' 필드 지원
  
  @Prop()
  manufacturer_id?: string; // 기존 DB 데이터의 'manufacturer_id' 필드 지원
  
  @Prop()
  base_trim_name?: string; // AppService에서 메인 리스트에 사용된 필드 지원
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
