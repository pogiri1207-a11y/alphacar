// kevin@devserver:~/alphacar/backend/quote/src/schemas$ cat estimate.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EstimateDocument = Estimate & Document;

@Schema()
class EstimatedCar {
    @Prop()
    manufacturer: string;
    
    @Prop()
    model: string;
    
    @Prop()
    trim: string;
    
    @Prop()
    price: number;
    
    @Prop()
    image: string;
    
    @Prop([String])
    options: string[];
}
const EstimatedCarSchema = SchemaFactory.createForClass(EstimatedCar);


@Schema({ timestamps: true, collection: 'estimates' })
export class Estimate {
    @Prop({ required: true, index: true })
    userId: string; // 사용자 ID (로컬스토리지의 user_social_id)

    @Prop({ required: true, enum: ['single', 'compare'] })
    type: string; // 견적 유형: single 또는 compare

    @Prop({ required: true })
    totalPrice: number; // 최종 견적 가격 합계

    @Prop({ type: [EstimatedCarSchema], required: true })
    cars: EstimatedCar[]; // 견적 차량 목록
}

export const EstimateSchema = SchemaFactory.createForClass(Estimate);
