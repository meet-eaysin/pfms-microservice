import { IsString } from 'class-validator';

export class DeleteExpenseCommand {
  @IsString()
  id!: string;

  @IsString()
  userId!: string;
}
