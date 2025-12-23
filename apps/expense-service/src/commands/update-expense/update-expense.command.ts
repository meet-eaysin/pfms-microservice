import { IsString, IsNumber, IsDateString, IsOptional, IsArray } from 'class-validator';

export class UpdateExpenseCommand {
  @IsString()
  id!: string;

  @IsString()
  userId!: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsDateString()
  date?: string;
}
