import { IsString, IsNumber, IsOptional, IsUUID, IsDateString, IsBoolean } from 'class-validator';

export class CreateExpenseDto {
  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsUUID()
  categoryId: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;
}
