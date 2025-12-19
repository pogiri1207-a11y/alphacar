// kevin@devserver:~/alphacar/backend/quote/src/schemas$ cat vehicle_trim.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VehicleTrimDocument = VehicleTrim & Document;

@Schema({ collection: 'vehicletrims', timestamps: true })
export class VehicleTrim {
    _id: Types.ObjectId; 
    
    // ✅ 이 vehicle_id 필드가 요청 ID와 매칭된다고 가정합니다.
    @Prop({ type: Types.ObjectId, required: true })
    vehicle_id: Types.ObjectId; 

    @Prop({ required: true })
    name: string; // 트림명
    
    @Prop({ required: true })
    base_price: number; // 기본 가격
    
    @Prop()
    image_url: string; 
}

export const VehicleTrimSchema = SchemaFactory.createForClass(VehicleTrim);
