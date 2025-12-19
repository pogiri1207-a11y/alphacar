import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReviewAnalysisDocument = ReviewAnalysis & Document;

@Schema({ collection: 'review_analysis' })
export class ReviewAnalysis {
  @Prop()
  vehicle_name: string;

  @Prop()
  brand_name: string;

  @Prop({ type: [String] })
  summary: string[];

  @Prop({ type: [String] })
  pros: string[];

  @Prop({ type: [String] })
  cons: string[];

  @Prop({ type: Object })
  sentiment_ratio: {
    positive: number;
    negative: number;
  };

  @Prop({ type: Object })
  avg_rating: number;

  @Prop({ type: Number })
  total_reviews: number;

  @Prop()
  updated_at: Date;
}

export const ReviewAnalysisSchema = SchemaFactory.createForClass(ReviewAnalysis);


