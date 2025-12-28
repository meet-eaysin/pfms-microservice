import { AccountType } from '@/domain/entities/account.model';
import { IsNotEmpty, IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';

export class CreateAccountDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsEnum(AccountType)
  type!: AccountType;

  @IsString()
  @IsOptional()
  subtype?: string;

  @IsString()
  @IsOptional()
  currency?: string = 'USD';

  @IsBoolean()
  @IsOptional()
  isMutable?: boolean = true;
}
