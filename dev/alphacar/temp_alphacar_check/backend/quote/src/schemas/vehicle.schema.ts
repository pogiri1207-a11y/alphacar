// src/schemas/vehicle.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

// ---------------------------------------------------------------
// 1. 하위 스키마 정의
// ---------------------------------------------------------------

// [하위] 옵션 정보 (trims -> options)
@Schema() // 👈 [수정됨] { _id: false } 삭제 -> 이제 자동으로 _id가 생성됩니다.
export class VehicleOption {
  @Prop({ type: MongooseSchema.Types.Mixed })
  option_name: any;

  @Prop({ type: MongooseSchema.Types.Mixed })
  option_description: any;

  @Prop({ type: MongooseSchema.Types.Mixed })
  option_price: any;

  @Prop({ type: MongooseSchema.Types.Mixed })
  option_price_formatted: any;
}
const VehicleOptionSchema = SchemaFactory.createForClass(VehicleOption);

// [하위] 트림 정보 (trims)
@Schema() // 👈 [수정됨] { _id: false } 삭제 -> 이제 자동으로 _id가 생성됩니다.
export class VehicleTrim {
  @Prop()
  trim_name: string;

  @Prop()
  price: number;

  @Prop()
  price_formatted: string;

  @Prop({ type: Object })
  specifications: Record<string, any>;

  @Prop({ type: [VehicleOptionSchema], default: [] })
  options: VehicleOption[];
}
const VehicleTrimSchema = SchemaFactory.createForClass(VehicleTrim);

// ... (이하 RatingBreakdown, VehicleReview 등 다른 스키마는 _id: false 유지해도 무방함) ...
// ... (ColorImage, StandardImage 등도 유지) ...

// [하위] 리뷰 평점 상세
@Schema({ _id: false })
export class RatingBreakdown {
  @Prop() comfort: number;
  @Prop() design: number;
  @Prop() driving_performance: number;
  @Prop() fuel_efficiency: number;
  @Prop() price: number;
  @Prop() quality: number;
}
const RatingBreakdownSchema = SchemaFactory.createForClass(RatingBreakdown);

// [하위] 리뷰 정보
@Schema({ _id: false })
export class VehicleReview {
  @Prop() review_id: string;
  @Prop() content: string;
  @Prop() published_date: string;
  @Prop() like_count: number;
  @Prop() overall_rating: number;
  @Prop({ type: RatingBreakdownSchema }) rating_breakdown: RatingBreakdown;
}
const VehicleReviewSchema = SchemaFactory.createForClass(VehicleReview);

// [하위] 색상 이미지
@Schema({ _id: false })
export class ColorImage {
  @Prop({ type: MongooseSchema.Types.Mixed }) color_name: any;
  @Prop({ type: MongooseSchema.Types.Mixed }) image_url: any;
  @Prop({ type: MongooseSchema.Types.Mixed }) order: any;
}
const ColorImageSchema = SchemaFactory.createForClass(ColorImage);

// [하위] 일반 이미지
@Schema({ _id: false })
export class StandardImage {
  @Prop({ type: MongooseSchema.Types.Mixed }) url: any;
  @Prop({ type: MongooseSchema.Types.Mixed }) order: any;
}
const StandardImageSchema = SchemaFactory.createForClass(StandardImage);

// ---------------------------------------------------------------
// 2. 메인 스키마 정의 (danawa_vehicle_data 컬렉션)
// ---------------------------------------------------------------

export type VehicleDocument = Vehicle & Document;

@Schema({
  collection: 'danawa_vehicle_data',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})
export class Vehicle {
  @Prop({ type: Types.ObjectId })
  _id: Types.ObjectId;

  @Prop({ required: true })
  model_id: string;

  @Prop({ required: true })
  lineup_id: string;

  @Prop({ required: true })
  vehicle_name: string;

  @Prop()
  vehicle_name_full: string;

  @Prop()
  brand_name: string;

  @Prop()
  vehicle_type: string;

  @Prop()
  base_trim_name: string;

  @Prop()
  model_year: string;

  @Prop()
  release_date: string;

  @Prop()
  fuel_type: string;

  @Prop()
  logo_url: string;

  @Prop()
  main_image: string;

  @Prop()
  is_active: boolean;

  @Prop()
  last_updated: Date;

  @Prop({ type: [VehicleTrimSchema], default: [] })
  trims: VehicleTrim[];

  @Prop({ type: [VehicleReviewSchema], default: [] })
  review: VehicleReview[];

  @Prop({ type: [ColorImageSchema], default: [] })
  color_images: ColorImage[];

  @Prop({ type: [StandardImageSchema], default: [] })
  exterior_images: StandardImage[];

  @Prop({ type: [StandardImageSchema], default: [] })
  interior_images: StandardImage[];

  @Prop({ type: [String], default: [] })
  source_urls: string[];
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
