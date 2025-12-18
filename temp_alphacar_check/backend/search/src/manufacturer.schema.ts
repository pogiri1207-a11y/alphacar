import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Document } from 'mongoose';

export type ManufacturerDocument = HydratedDocument<Manufacturer>;

@Schema({ collection: 'manufacturers' })
export class Manufacturer extends Document {
  @Prop({ required: true })
  name: string;
}

export const ManufacturerSchema = SchemaFactory.createForClass(Manufacturer);
