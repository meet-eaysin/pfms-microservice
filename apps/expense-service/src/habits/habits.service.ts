import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { LogHabitDto } from './dto/log-habit.dto';

@Injectable()
export class HabitsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateHabitDto) {
    return this.prisma.habit.create({
      data: {
        userId,
        name: dto.name,
        unitCost: dto.unitCost,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.habit.findMany({
      where: { userId },
      include: { logs: true },
    });
  }

  async log(userId: string, habitId: string, dto: LogHabitDto) {
    const habit = await this.prisma.habit.findUnique({
      where: { id: habitId, userId }, // Ensure ownership
    });
    if (!habit) throw new NotFoundException('Habit not found');

    return this.prisma.habitLog.create({
      data: {
        habitId,
        quantity: dto.quantity,
        date: new Date(dto.date),
      },
    });
  }
}
