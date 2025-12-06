// kevin@devserver:~/alphacar/backend/quote/src/schemas$ cat vehicle.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VehicleDocument = Vehicle & Document;

@Schema({ collection: 'vehicles' })
export class Vehicle {
    _id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true })
    manufacturer_id: Types.ObjectId;

    @Prop({ required: true })
    model_name: string;

    @Prop()
    model_year: number;

    @Prop()
    image_url: string;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
