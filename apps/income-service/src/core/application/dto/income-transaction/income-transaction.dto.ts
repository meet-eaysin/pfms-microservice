import {
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class RecordIncomeDto {
  @IsNotEmpty()
  @IsUUID()
  sourceId!: string;

  @IsNotEmpty()
  @IsNumber()
  amount!: number;

  @IsNotEmpty()
  @IsDateString()
  date!: string;

  @IsBoolean()
  @IsOptional()
  isTaxable?: boolean = true;

  @IsString()
  @IsOptional()
  notes?: string;
}
