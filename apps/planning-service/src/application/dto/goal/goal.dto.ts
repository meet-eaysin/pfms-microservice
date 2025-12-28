import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateGoalDto {
  @ApiProperty({ example: 'user-123' })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ example: 'Vacation Fund' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Savings for summer vacation' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  targetAmount!: number;

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsDateString()
  @IsOptional()
  deadline?: string;
}

export class ContributeToGoalDto {
  @ApiProperty({ example: 500 })
  @IsNumber()
  amount!: number;

  @ApiProperty({ example: '2025-12-28' })
  @IsDateString()
  date!: string;

  @ApiPropertyOptional({ example: 'Monthly savings' })
  @IsString()
  @IsOptional()
  notes?: string;
}
