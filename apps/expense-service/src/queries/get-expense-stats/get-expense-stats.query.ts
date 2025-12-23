import { IsString, IsOptional, IsDateString } from 'class-validator';

export class GetExpenseStatsQuery {
  @IsString()
  userId!: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;
}
