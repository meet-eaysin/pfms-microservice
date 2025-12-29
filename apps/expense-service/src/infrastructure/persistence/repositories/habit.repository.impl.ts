import { Injectable } from '@nestjs/common';
import { IHabitRepository } from '../../../domain/interfaces/habit.repository';
import { Habit, HabitLog } from '../../../domain/entities/habit.model';
import { PrismaService } from '../prisma.service';
import { Habit as PrismaHabit, HabitLog as PrismaHabitLog } from '@prisma/client';

@Injectable()
export class PrismaHabitRepository implements IHabitRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomainHabit(prismaHabit: PrismaHabit): Habit {
    return new Habit(
      prismaHabit.id,
      prismaHabit.userId,
      prismaHabit.name,
      Number(prismaHabit.unitCost),
      prismaHabit.createdAt,
      prismaHabit.updatedAt
    );
  }

  private toDomainLog(prismaLog: PrismaHabitLog): HabitLog {
    return new HabitLog(
      prismaLog.id,
      prismaLog.habitId,
      prismaLog.quantity,
      prismaLog.date,
      prismaLog.createdAt
    );
  }

  async create(habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Habit> {
    const created = await this.prisma.habit.create({
      data: {
        userId: habit.userId,
        name: habit.name,
        unitCost: habit.unitCost,
      },
    });
    return this.toDomainHabit(created);
  }

  async findAll(userId: string): Promise<Habit[]> {
    const habits = await this.prisma.habit.findMany({ where: { userId } });
    return habits.map((h) => this.toDomainHabit(h));
  }

  async findById(id: string): Promise<Habit | null> {
    const habit = await this.prisma.habit.findUnique({ where: { id } });
    return habit ? this.toDomainHabit(habit) : null;
  }

  async logHabit(log: Omit<HabitLog, 'id' | 'createdAt'>): Promise<HabitLog> {
    const created = await this.prisma.habitLog.create({
      data: {
        habitId: log.habitId,
        quantity: log.quantity,
        date: log.date,
      },
    });
    return this.toDomainLog(created);
  }
}
