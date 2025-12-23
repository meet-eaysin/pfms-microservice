import { IsString } from 'class-validator';

export class GetExpenseQuery {
  @IsString()
  id!: string;

  @IsString()
  userId!: string;
}
