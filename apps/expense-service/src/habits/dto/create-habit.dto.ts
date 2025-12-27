import { IsString, IsNumber } from 'class-validator';

export class CreateHabitDto {
  @IsString()
  name: string;

  @IsNumber()
  unitCost: number;
}
