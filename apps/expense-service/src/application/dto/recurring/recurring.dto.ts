import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsDateString,
} from 'class-validator';
import { Frequency } from '../../../domain/entities/recurring-expense.model';

export class CreateRecurringDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNotEmpty()
  @IsEnum(Frequency)
  frequency: Frequency;

  @IsNotEmpty()
  @IsInt()
  interval: number;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;
}
