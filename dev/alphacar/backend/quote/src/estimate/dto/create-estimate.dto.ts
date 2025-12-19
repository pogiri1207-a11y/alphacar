// kevin@devserver:~/alphacar/backend/quote/src/estimate/dto$ cat create-estimate.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsIn, IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CarDetailDto {
    @IsString() @IsNotEmpty() manufacturer: string;
    @IsString() @IsNotEmpty() model: string;
    @IsString() @IsNotEmpty() trim: string;
    @IsNumber() price: number;
    @IsString() image: string;
    @IsArray() options: string[];
}

export class CreateEstimateDto {
    @IsString() @IsNotEmpty() userId: string;

    @IsIn(['single', 'compare']) type: 'single' | 'compare';

    @IsNumber() totalPrice: number;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CarDetailDto)
    cars: CarDetailDto[];
}
