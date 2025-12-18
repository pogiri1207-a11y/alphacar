// src/sales/dto/create-sales-ranking.dto.ts
import { IsNumber, IsString, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class SalesRecordDto {
  @IsOptional()
  @IsNumber()
  sales?: number;

  @IsOptional()
  @IsNumber()
  change?: number;

  @IsOptional()
  @IsNumber()
  change_rate?: number;
}

class RankingItemDto {
  @IsNumber()
  rank: number;

  @IsString()
  model_name: string;

  @IsOptional()
  @IsString()
  model_image?: string;

  @IsNumber()
  sales_volume: number;

  @IsNumber()
  market_share: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => SalesRecordDto)
  previous_month?: SalesRecordDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SalesRecordDto)
  previous_year?: SalesRecordDto;
}

export class CreateSalesRankingDto {
  @IsString()
  data_type: string; // "all" or "import"

  @IsNumber()
  year: number;

  @IsNumber()
  month: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RankingItemDto)
  rankings: RankingItemDto[];
}
