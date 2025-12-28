import { Habit, HabitLog } from '../entities/habit.model';

export interface IHabitRepository {
  create(habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Habit>;
  findAll(userId: string): Promise<Habit[]>;
  findById(id: string): Promise<Habit | null>;
  logHabit(log: Omit<HabitLog, 'id' | 'createdAt'>): Promise<HabitLog>;
}
