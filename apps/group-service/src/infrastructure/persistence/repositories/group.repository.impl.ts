import { Injectable } from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { IGroupRepository } from '../../../domain/interfaces/group.repository.interface';
import {
  FinanceGroup,
  GroupMember,
  GroupExpense,
  ExpenseSplit,
  Settlement,
  MemberRole,
  SplitType,
  SettlementStatus,
} from '../../../domain/entities/group.entity';

@Injectable()
export class PrismaGroupRepository implements IGroupRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Group
  async createGroup(group: FinanceGroup): Promise<FinanceGroup> {
    const data = await this.prisma.group.create({
      data: {
        id: group.id,
        name: group.name,
        description: group.description,
        groupType: group.groupType,
        createdBy: group.createdBy,
        isActive: group.isActive,
      },
    });

    return new FinanceGroup(
      data.id,
      data.name,
      data.createdBy,
      data.description || undefined,
      data.groupType,
      data.isActive,
      data.createdAt,
      data.updatedAt
    );
  }

  async findGroupById(id: string): Promise<FinanceGroup | null> {
    const data = await this.prisma.group.findUnique({ where: { id } });
    if (!data) return null;

    return new FinanceGroup(
      data.id,
      data.name,
      data.createdBy,
      data.description || undefined,
      data.groupType,
      data.isActive,
      data.createdAt,
      data.updatedAt
    );
  }

  async findGroupsByUserId(userId: string): Promise<FinanceGroup[]> {
    const data = await this.prisma.group.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
    });

    return data.map(
      (d) =>
        new FinanceGroup(
          d.id,
          d.name,
          d.createdBy,
          d.description || undefined,
          d.groupType,
          d.isActive,
          d.createdAt,
          d.updatedAt
        )
    );
  }

  async updateGroup(group: FinanceGroup): Promise<FinanceGroup> {
    const data = await this.prisma.group.update({
      where: { id: group.id },
      data: {
        name: group.name,
        description: group.description,
        isActive: group.isActive,
      },
    });

    return new FinanceGroup(
      data.id,
      data.name,
      data.createdBy,
      data.description || undefined,
      data.groupType,
      data.isActive,
      data.createdAt,
      data.updatedAt
    );
  }

  // Member
  async addMember(member: GroupMember): Promise<GroupMember> {
    const data = await this.prisma.member.create({
      data: {
        id: member.id,
        groupId: member.groupId,
        userId: member.userId,
        role: member.role as $Enums.MemberRole,
        displayName: member.displayName,
        isActive: member.isActive,
      },
    });

    return new GroupMember(
      data.id,
      data.groupId,
      data.userId,
      data.role as MemberRole,
      data.displayName || undefined,
      data.isActive,
      data.joinedAt
    );
  }

  async findMembersByGroupId(groupId: string): Promise<GroupMember[]> {
    const data = await this.prisma.member.findMany({ where: { groupId } });
    return data.map(
      (d) =>
        new GroupMember(
          d.id,
          d.groupId,
          d.userId,
          d.role as MemberRole,
          d.displayName || undefined,
          d.isActive,
          d.joinedAt
        )
    );
  }

  async findMember(groupId: string, userId: string): Promise<GroupMember | null> {
    const data = await this.prisma.member.findUnique({
      where: {
        groupId_userId: { groupId, userId },
      },
    });
    if (!data) return null;

    return new GroupMember(
      data.id,
      data.groupId,
      data.userId,
      data.role as MemberRole,
      data.displayName || undefined,
      data.isActive,
      data.joinedAt
    );
  }

  async updateMember(member: GroupMember): Promise<GroupMember> {
    const data = await this.prisma.member.update({
      where: { id: member.id },
      data: {
        role: member.role as $Enums.MemberRole,
        displayName: member.displayName,
        isActive: member.isActive,
      },
    });

    return new GroupMember(
      data.id,
      data.groupId,
      data.userId,
      data.role as MemberRole,
      data.displayName || undefined,
      data.isActive,
      data.joinedAt
    );
  }

  // Expense
  async createExpense(expense: GroupExpense, splits: ExpenseSplit[]): Promise<GroupExpense> {
    const data = await this.prisma.expense.create({
      data: {
        id: expense.id,
        groupId: expense.groupId,
        paidBy: expense.paidBy,
        amount: expense.amount,
        currency: expense.currency,
        description: expense.description,
        category: expense.category,
        date: expense.date,
        splitType: expense.splitType as $Enums.SplitType,
        splits: {
          create: splits.map((s) => ({
            id: s.id,
            userId: s.userId,
            shareAmount: s.shareAmount,
            sharePercentage: s.sharePercentage,
            isPaid: s.isPaid,
            paidAt: s.paidAt,
          })),
        },
      },
    });

    return new GroupExpense(
      data.id,
      data.groupId,
      data.paidBy,
      data.amount.toNumber(),
      data.currency,
      data.description,
      data.date,
      data.splitType as SplitType,
      data.category || undefined,
      data.createdAt,
      data.updatedAt
    );
  }

  async findExpenseById(id: string): Promise<GroupExpense | null> {
    const data = await this.prisma.expense.findUnique({ where: { id } });
    if (!data) return null;

    return new GroupExpense(
      data.id,
      data.groupId,
      data.paidBy,
      data.amount.toNumber(),
      data.currency,
      data.description,
      data.date,
      data.splitType as SplitType,
      data.category || undefined,
      data.createdAt,
      data.updatedAt
    );
  }

  async findExpensesByGroupId(groupId: string): Promise<GroupExpense[]> {
    const data = await this.prisma.expense.findMany({ where: { groupId } });
    return data.map(
      (d) =>
        new GroupExpense(
          d.id,
          d.groupId,
          d.paidBy,
          d.amount.toNumber(),
          d.currency,
          d.description,
          d.date,
          d.splitType as SplitType,
          d.category || undefined,
          d.createdAt,
          d.updatedAt
        )
    );
  }

  async findSplitsByExpenseId(expenseId: string): Promise<ExpenseSplit[]> {
    const data = await this.prisma.split.findMany({ where: { groupExpenseId: expenseId } });
    return data.map(
      (d) =>
        new ExpenseSplit(
          d.id,
          d.groupExpenseId,
          d.userId,
          d.shareAmount.toNumber(),
          d.sharePercentage?.toNumber() || undefined,
          d.isPaid,
          d.paidAt || undefined,
          d.createdAt
        )
    );
  }

  // Settlement
  async createSettlement(settlement: Settlement): Promise<Settlement> {
    const data = await this.prisma.settlement.create({
      data: {
        id: settlement.id,
        groupId: settlement.groupId,
        fromUserId: settlement.fromUserId,
        toUserId: settlement.toUserId,
        amount: settlement.amount,
        currency: settlement.currency,
        status: settlement.status as $Enums.SettlementStatus,
        settlementDate: settlement.settlementDate,
        notes: settlement.notes,
      },
    });

    return new Settlement(
      data.id,
      data.groupId,
      data.fromUserId,
      data.toUserId,
      data.amount.toNumber(),
      data.currency,
      data.status as SettlementStatus,
      data.settlementDate || undefined,
      data.notes || undefined,
      data.createdAt,
      data.updatedAt
    );
  }

  async findSettlementsByGroupId(groupId: string): Promise<Settlement[]> {
    const data = await this.prisma.settlement.findMany({ where: { groupId } });
    return data.map(
      (d) =>
        new Settlement(
          d.id,
          d.groupId,
          d.fromUserId,
          d.toUserId,
          d.amount.toNumber(),
          d.currency,
          d.status as SettlementStatus,
          d.settlementDate || undefined,
          d.notes || undefined,
          d.createdAt,
          d.updatedAt
        )
    );
  }

  async updateSettlement(settlement: Settlement): Promise<Settlement> {
    const data = await this.prisma.settlement.update({
      where: { id: settlement.id },
      data: {
        status: settlement.status as $Enums.SettlementStatus,
        settlementDate: settlement.settlementDate,
        notes: settlement.notes,
      },
    });

    return new Settlement(
      data.id,
      data.groupId,
      data.fromUserId,
      data.toUserId,
      data.amount.toNumber(),
      data.currency,
      data.status as SettlementStatus,
      data.settlementDate || undefined,
      data.notes || undefined,
      data.createdAt,
      data.updatedAt
    );
  }
}
