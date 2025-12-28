import { IsNotEmpty, IsString, IsNumber, IsInt, IsDateString, IsUUID } from 'class-validator';

export class CreateHabitDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  unitCost: number;
}

export class LogHabitDto {
  @IsNotEmpty()
  @IsUUID()
  habitId: string;

  @IsNotEmpty()
  @IsInt()
  quantity: number;

  @IsNotEmpty()
  @IsDateString()
  date: string;
}
