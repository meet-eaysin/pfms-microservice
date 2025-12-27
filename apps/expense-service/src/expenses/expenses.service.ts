import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { EventPublisher } from '@/infrastructure/messaging/event.publisher';

interface IUserRequest {
  user: {
    id: string;
  };
}

@Injectable()
export class ExpensesService {
  constructor(
    private prisma: PrismaService,
    private eventPublisher: EventPublisher
  ) {}

  async create(userId: string, dto: CreateExpenseDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) throw new NotFoundException('Category not found');

    const expense = await this.prisma.expense.create({
      data: {
        userId,
        amount: dto.amount,
        currency: dto.currency || 'USD',
        categoryId: dto.categoryId,
        date: new Date(dto.date),
        description: dto.description,
        isRecurring: dto.isRecurring || false,
      },
    });

    await this.eventPublisher.publish('expense.created', expense);

    return expense;
  }

  async findAll(
    userId: string,
    filters: { startDate?: string; endDate?: string; categoryId?: string }
  ) {
    const where: any = { userId };

    if (filters.startDate && filters.endDate) {
      where.date = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    return this.prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
      include: { category: true },
    });
  }

  async findOne(id: string, userId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, userId },
      include: { category: true },
    });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async update(id: string, userId: string, dto: UpdateExpenseDto) {
    // Check existence
    await this.findOne(id, userId);

    const updated = await this.prisma.expense.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });

    await this.eventPublisher.publish('expense.updated', updated);
    return updated;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    const deleted = await this.prisma.expense.delete({
      where: { id },
    });

    await this.eventPublisher.publish('expense.deleted', { id: deleted.id, userId });
    return { success: true };
  }
}
