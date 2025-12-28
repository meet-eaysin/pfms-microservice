import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { BudgetPeriod } from '../../../domain/entities/budget.model';

export class CreateBudgetDto {
  @ApiProperty({ example: 'user-123' })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiPropertyOptional({ example: 'dining-out' })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ example: 'Dining Out Budget' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 500 })
  @IsNumber()
  amountLimit!: number;

  @ApiProperty({ enum: BudgetPeriod, example: BudgetPeriod.MONTHLY })
  @IsEnum(BudgetPeriod)
  period!: BudgetPeriod;

  @ApiProperty({ example: '2025-01-01' })
  @IsDateString()
  startDate!: string;

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
