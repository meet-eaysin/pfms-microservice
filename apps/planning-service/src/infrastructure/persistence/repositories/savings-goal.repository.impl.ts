import { Injectable } from '@nestjs/common';
import { ISavingsGoalRepository } from '../../../core/domain/repositories/savings-goal.repository';
import { SavingsGoal } from '../../../core/domain/models/savings-goal.model';
import { PrismaService } from '../prisma.service';
import { SavingsGoal as PrismaSavingsGoal } from '@prisma/client';

@Injectable()
export class PrismaSavingsGoalRepository implements ISavingsGoalRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId: string;
    name: string;
    description?: string;
    targetAmount: number;
    deadline?: Date;
  }): Promise<SavingsGoal> {
    const goal = await this.prisma.savingsGoal.create({
      data: {
        userId: data.userId,
        name: data.name,
        description: data.description || null,
        targetAmount: data.targetAmount,
        deadline: data.deadline || null,
      },
    });
    return this.toDomain(goal);
  }

  async findById(id: string): Promise<SavingsGoal | null> {
    const goal = await this.prisma.savingsGoal.findUnique({ where: { id } });
    return goal ? this.toDomain(goal) : null;
  }

  async findByUserId(userId: string): Promise<SavingsGoal[]> {
    const goals = await this.prisma.savingsGoal.findMany({ where: { userId } });
    return goals.map((g) => this.toDomain(g));
  }

  async contribute(
    goalId: string,
    amount: number,
    date: Date,
    notes?: string
  ): Promise<SavingsGoal> {
    // Create contribution and update goal's current amount
    const [_, goal] = await this.prisma.$transaction([
      this.prisma.goalContribution.create({
        data: {
          goalId,
          amount,
          date,
          notes: notes || null,
        },
      }),
      this.prisma.savingsGoal.update({
        where: { id: goalId },
        data: {
          currentAmount: {
            increment: amount,
          },
        },
      }),
    ]);

    return this.toDomain(goal);
  }

  async complete(id: string): Promise<SavingsGoal> {
    const goal = await this.prisma.savingsGoal.update({
      where: { id },
      data: { isCompleted: true },
    });
    return this.toDomain(goal);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.savingsGoal.delete({ where: { id } });
  }

  private toDomain(goal: PrismaSavingsGoal): SavingsGoal {
    return new SavingsGoal(
      goal.id,
      goal.userId,
      goal.name,
      goal.description,
      Number(goal.targetAmount),
      Number(goal.currentAmount),
      goal.deadline,
      goal.isCompleted,
      goal.createdAt,
      goal.updatedAt
    );
  }
}
