// kevin@devserver:~/alphacar/backend/quote/src/schemas$ cat manufacturer.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ManufacturerDocument = Manufacturer & Document;

@Schema({ collection: 'manufacturers' })
export class Manufacturer {
    _id: Types.ObjectId;

    @Prop({ required: true, unique: true })
    name: string;
}

export const ManufacturerSchema = SchemaFactory.createForClass(Manufacturer);
