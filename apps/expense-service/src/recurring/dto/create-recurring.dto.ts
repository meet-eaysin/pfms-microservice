import { IsString, IsEnum, IsNumber, IsUUID, IsDateString, IsOptional } from 'class-validator';
import { Frequency } from '@prisma/client';

export class CreateRecurringExpenseDto {
  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(Frequency)
  frequency: Frequency;

  @IsNumber()
  @IsOptional()
  interval?: number;

  @IsDateString()
  startDate: string;
}
