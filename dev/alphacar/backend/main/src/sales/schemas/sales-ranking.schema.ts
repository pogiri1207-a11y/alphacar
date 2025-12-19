// src/sales/schemas/sales-ranking.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// 1. 하위 객체 스키마 정의 (전월/전년 실적)
@Schema({ _id: false }) // 하위 객체는 별도 _id 불필요
export class SalesRecord {
  @Prop()
  sales: number; // 판매량

  @Prop()
  change: number; // 변동량

  @Prop()
  change_rate: number; // 변동률
}
const SalesRecordSchema = SchemaFactory.createForClass(SalesRecord);

// 2. 랭킹 아이템 스키마
@Schema({ _id: false })
export class RankingItem {
  @Prop()
  rank: number;

  @Prop()
  model_name: string;

  @Prop({ required: false })
  model_image: string; // null일 수 있음

  @Prop()
  sales_volume: number;

  @Prop()
  market_share: number; // DB엔 숫자로 저장됨 (예: 8.6)

  @Prop({ type: SalesRecordSchema })
  previous_month: SalesRecord;

  @Prop({ type: SalesRecordSchema })
  previous_year: SalesRecord;
}
const RankingItemSchema = SchemaFactory.createForClass(RankingItem);

// 3. 최상위 문서 스키마
@Schema({ collection: 'sales_rankings' })
export class SalesRanking extends Document {
  @Prop()
  year: number; // DB엔 NumberInt로 저장됨

  @Prop()
  month: number; // DB엔 NumberInt로 저장됨

  @Prop()
  data_type: string; // "all" 또는 "import"

  @Prop({ type: [RankingItemSchema] })
  rankings: RankingItem[];

  @Prop()
  created_at: Date;

  @Prop()
  updated_at: Date;
}

export const SalesRankingSchema = SchemaFactory.createForClass(SalesRanking);
