import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { CreateRecurringExpenseDto } from './dto/create-recurring.dto';
import { addTime, parseISO } from '@pfms/date';
import { Frequency } from '@prisma/client';

@Injectable()
export class RecurringService {
  constructor(private prisma: PrismaService) {}

  private calculateNextDueDate(start: Date, frequency: Frequency, interval: number = 1): Date {
    // Basic calculation for the *next* due date relative to now or start
    // If start is in future, next due is start.
    // If start is past, we need to calculate the next one.
    // For MVP simplification: Set nextDueDate = startDate (if future) or startDate + interval (if past? logic can be complex).
    // Let's assume start date is the first occurrence.
    return new Date(start);
  }

  async create(userId: string, dto: CreateRecurringExpenseDto) {
    const nextDueDate = this.calculateNextDueDate(
      parseISO(dto.startDate),
      dto.frequency,
      dto.interval
    );

    return this.prisma.recurringExpense.create({
      data: {
        userId,
        amount: dto.amount,
        description: dto.description,
        frequency: dto.frequency,
        interval: dto.interval || 1,
        startDate: parseISO(dto.startDate),
        nextDueDate,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.recurringExpense.findMany({
      where: { userId },
      orderBy: { nextDueDate: 'asc' },
    });
  }
}
