import { IsString, IsOptional, IsEmail, IsDateString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;
}

export class UpdateFinancialPreferencesDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  baseCurrency?: string;

  @IsOptional()
  @IsDateString()
  fiscalYearStart?: string;

  @IsOptional()
  @IsString()
  riskTolerance?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export class UpdateNotificationSettingsDto {
  @IsOptional()
  emailDailyDigest?: boolean;

  @IsOptional()
  pushTransactions?: boolean;

  @IsOptional()
  emailWeeklyReport?: boolean;

  @IsOptional()
  pushBudgetAlerts?: boolean;
}

export class InviteFamilyMemberDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  relationship!: string;
}
