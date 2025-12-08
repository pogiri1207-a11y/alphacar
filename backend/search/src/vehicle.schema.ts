import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Document, Types } from 'mongoose';

export type VehicleDocument = HydratedDocument<Vehicle>;

// 'danawa_vehicle_data' 컬렉션에 연결
@Schema({ collection: 'danawa_vehicle_data' })
export class Vehicle extends Document {
  @Prop({ required: true })
  brand_name: string;

  @Prop({ required: true })
  vehicle_name: string;

  @Prop()
  lineup_id?: string;

  @Prop()
  main_image?: string;

  @Prop()
  release_date?: string;

  @Prop()
  model_year?: string;

  @Prop({ type: Array })
  trims?: any[];

  @Prop({ type: Object })
  specifications?: any;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
