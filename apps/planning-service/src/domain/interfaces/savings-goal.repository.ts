import { SavingsGoal } from '../entities/savings-goal.model';

export interface ISavingsGoalRepository {
  create(data: {
    userId: string;
    name: string;
    description?: string;
    targetAmount: number;
    deadline?: Date;
  }): Promise<SavingsGoal>;

  findById(id: string): Promise<SavingsGoal | null>;

  findByUserId(userId: string): Promise<SavingsGoal[]>;

  contribute(goalId: string, amount: number, date: Date, notes?: string): Promise<SavingsGoal>;

  complete(id: string): Promise<SavingsGoal>;

  delete(id: string): Promise<void>;
}
