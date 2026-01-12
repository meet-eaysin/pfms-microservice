import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { LoanType, InterestType } from '../../../domain/entities/loan.entity';

export class CreateLoanDto {
  @IsNotEmpty()
  @IsUUID()
  contactId!: string;

  @IsNotEmpty()
  @IsEnum(LoanType)
  type!: LoanType;

  @IsNotEmpty()
  @IsNumber()
  principalAmount!: number;

  @IsString()
  @IsOptional()
  currency?: string = 'USD';

  @IsNumber()
  @IsOptional()
  interestRate?: number;

  @IsEnum(InterestType)
  @IsOptional()
  interestType?: InterestType;

  @IsNotEmpty()
  @IsDateString()
  startDate!: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsBoolean()
  @IsOptional()
  emiEnabled?: boolean;

  @IsNumber()
  @IsOptional()
  emiAmount?: number;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  category?: string;
}
