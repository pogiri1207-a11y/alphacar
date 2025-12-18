// kevin@devserver:~/alphacar/backend/quote/src/schemas$ cat vehicle_option.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VehicleOptionDocument = VehicleOption & Document;

@Schema({ collection: 'vehicleoptions' })
export class VehicleOption {
    _id: Types.ObjectId;

    @Prop()
    name: string;

    @Prop()
    price: number;

    // ✅ trim_id는 해당 트림의 실제 _id와 연결되어 옵션을 찾을 때 사용됩니다.
    @Prop({ type: Types.ObjectId, required: true })
    trim_id: Types.ObjectId; 
}

export const VehicleOptionSchema = SchemaFactory.createForClass(VehicleOption);
