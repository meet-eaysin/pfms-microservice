import {
  IsString,
  IsNumber,
  IsEnum,
  IsDate,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '../../domain/entities/transaction.entity';
import { Type } from 'class-transformer';

export class RecordTransactionDto {
  @ApiProperty({ example: 'AAPL' })
  @IsString()
  symbol!: string;

  @ApiProperty({ enum: TransactionType, example: TransactionType.BUY })
  @IsEnum(TransactionType)
  type!: TransactionType;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0.00000001)
  quantity!: number;

  @ApiProperty({ example: 150.25 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ example: 5.0 })
  @IsNumber()
  @IsOptional()
  fees?: number;

  @ApiPropertyOptional({ example: 2.0 })
  @IsNumber()
  @IsOptional()
  tax?: number;

  @ApiProperty({ example: '2024-01-01T10:00:00Z' })
  @IsDate()
  @Type(() => Date)
  date!: Date;
}
