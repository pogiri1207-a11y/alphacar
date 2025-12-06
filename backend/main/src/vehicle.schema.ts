// alphacar-project/alphacar/alphacar-0f6f51352a76b0977fcac48535606711be26d728/backend/main/src/vehicle.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Document, Types } from 'mongoose';
import { Manufacturer } from './manufacturer.schema';

export type VehicleDocument = HydratedDocument<Vehicle>;

// 'vehicles' 컬렉션에 연결
@Schema({ 
    collection: 'vehicles' 
    // 👈 [제거] toJSON 옵션은 아래에서 VehicleSchema에 직접 적용합니다.
})
export class Vehicle extends Document {
  // 차량 이름 (DB: model_name)
  @Prop({ required: true })
  model_name: string;

  // 👈 [수정] 제조사 참조 필드명을 실제 DB 필드명인 manufacturer_id로 변경
  @Prop({ type: Types.ObjectId, ref: Manufacturer.name, required: true })
  manufacturer_id: Types.ObjectId;

  // 대표 이미지 URL (DB: image_url)
  @Prop()
  image_url: string;
  
  // 👈 [수정] 가격 필드명을 실제 DB 필드명인 base_price로 변경
  @Prop()
  base_price: number; 
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);

// toJSON 옵션을 스키마에 직접 적용하여 _id를 trimId로 변환
VehicleSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc: any, ret: any) => { // doc, ret 타입을 any로 캐스팅하여 TS2339, TS2790 해결
        // 🚨 핵심 수정: ret.id 대신 ret.trimId에 _id 값을 매핑합니다.
        if (ret._id) {
            ret.trimId = ret._id.toString(); // _id를 trimId (문자열)로 변환하여 추가
        }
        delete ret._id; // 원본 _id 필드 제거

        return ret; // 변환된 객체를 반환
    },
});
