import { IsNumber, IsDateString, IsOptional } from 'class-validator';

export class LogHabitDto {
  @IsNumber()
  quantity: number;

  @IsDateString()
  date: string;
}
