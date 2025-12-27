import { IsNotEmpty, IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { AccountType } from '../../../domain/models/account.model';

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
