// src/vehicles/dto/create-vehicle.dto.ts

import { IsString, IsNumber, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

// 트림 정보 DTO (trims의 객체 배열을 정의)
class TrimDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;
}

export class CreateVehicleDto {
  @IsString()
  brand_name: string; 

  @IsString()
  vehicle_name: string; 

  @IsNumber()
  year: number; 

  @IsNumber()
  price: number; 

  @IsOptional()
  @IsString()
  main_image?: string; 

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrimDto)
  trims: TrimDto[]; 

  @IsOptional()
  @IsString()
  color?: string; 

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[]; 
}
