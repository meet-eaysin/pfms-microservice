import { IsNotEmpty, IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateContactDto {
  @IsNotEmpty()
  @IsString()
  contactType!: 'app_user' | 'external';

  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  relationship?: string;
}
