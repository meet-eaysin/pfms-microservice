import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SplitType } from '../../../domain/entities/group.entity';

class SplitDto {
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsOptional()
  @IsNumber()
  shareAmount?: number;

  @IsOptional()
  @IsNumber()
  sharePercentage?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;
}

export class AddExpenseDto {
  @IsNotEmpty()
  @IsNumber()
  amount!: number;

  @IsString()
  @IsOptional()
  currency?: string = 'USD';

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsNotEmpty()
  @IsDateString()
  date!: string;

  @IsEnum(SplitType)
  @IsOptional()
  splitType?: SplitType = SplitType.EQUAL;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SplitDto)
  splits!: SplitDto[];
}
