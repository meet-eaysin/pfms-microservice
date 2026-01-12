import { IsNotEmpty, IsNumber, IsDateString, IsUUID, IsOptional, IsString } from 'class-validator';

export class RecordLoanPaymentDto {
  @IsNotEmpty()
  @IsUUID()
  loanId!: string;

  @IsOptional()
  @IsUUID()
  emiScheduleId?: string;

  @IsNotEmpty()
  @IsNumber()
  amount!: number;

  @IsNotEmpty()
  @IsDateString()
  paymentDate!: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
