import { IsNotEmpty, IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { IncomeType, PaySchedule } from '../../domain/models/income-source.model';

export class CreateIncomeSourceDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsEnum(IncomeType)
  type!: IncomeType;

  @IsString()
  @IsOptional()
  currency?: string = 'USD';

  @IsObject()
  @IsOptional()
  paySchedule?: PaySchedule;
}

export class UpdateIncomeSourceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(IncomeType)
  @IsOptional()
  type?: IncomeType;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsObject()
  @IsOptional()
  paySchedule?: PaySchedule;
}
