import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IGroupRepository } from '../../domain/interfaces/group.repository.interface';
import { GroupExpense, ExpenseSplit, SplitType } from '../../domain/entities/group.entity';
import { AddExpenseDto } from '../dto/group/add-expense.dto';

@Injectable()
export class AddExpenseUseCase {
  constructor(private readonly repository: IGroupRepository) {}

  async execute(groupId: string, paidBy: string, dto: AddExpenseDto): Promise<GroupExpense> {
    // 1. Verify group exists
    const group = await this.repository.findGroupById(groupId);
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // 2. Verify all split participants are members
    const members = await this.repository.findMembersByGroupId(groupId);
    const memberUserIds = new Set(members.map((m) => m.userId));

    for (const split of dto.splits) {
      if (!memberUserIds.has(split.userId)) {
        throw new BadRequestException(`User ${split.userId} is not a member of this group`);
      }
    }

    // 3. Create Expense entity
    const expense = new GroupExpense(
      uuidv4(),
      groupId,
      paidBy,
      dto.amount,
      dto.currency || 'USD',
      dto.description,
      new Date(dto.date),
      dto.splitType || SplitType.EQUAL,
      dto.category
    );

    // 4. Calculate Splits
    const splits: ExpenseSplit[] = this.calculateSplits(expense, dto);

    // 5. Save Expense and Splits
    return this.repository.createExpense(expense, splits);
  }

  private calculateSplits(expense: GroupExpense, dto: AddExpenseDto): ExpenseSplit[] {
    const splits: ExpenseSplit[] = [];
    const totalAmount = expense.amount;
    const numSplits = dto.splits.length;

    if (numSplits === 0) {
      throw new BadRequestException('At least one split participant is required');
    }

    switch (expense.splitType) {
      case SplitType.EQUAL: {
        const shareAmount = totalAmount / numSplits;
        // Handle rounding: give the remainder to the first person or handle properly
        // For now, simple division
        for (const splitDto of dto.splits) {
          splits.push(
            new ExpenseSplit(uuidv4(), expense.id, splitDto.userId, shareAmount, 100 / numSplits)
          );
        }
        break;
      }
      case SplitType.UNEQUAL: {
        let sum = 0;
        for (const splitDto of dto.splits) {
          if (splitDto.shareAmount === undefined) {
            throw new BadRequestException('shareAmount is required for UNEQUAL split');
          }
          sum += splitDto.shareAmount;
          splits.push(
            new ExpenseSplit(uuidv4(), expense.id, splitDto.userId, splitDto.shareAmount)
          );
        }
        if (Math.abs(sum - totalAmount) > 0.01) {
          throw new BadRequestException('Total split amount must equal expense amount');
        }
        break;
      }
      case SplitType.PERCENTAGE: {
        let totalPercent = 0;
        for (const splitDto of dto.splits) {
          if (splitDto.sharePercentage === undefined) {
            throw new BadRequestException('sharePercentage is required for PERCENTAGE split');
          }
          totalPercent += splitDto.sharePercentage;
          const shareAmount = (totalAmount * splitDto.sharePercentage) / 100;
          splits.push(
            new ExpenseSplit(
              uuidv4(),
              expense.id,
              splitDto.userId,
              shareAmount,
              splitDto.sharePercentage
            )
          );
        }
        if (Math.abs(totalPercent - 100) > 0.01) {
          throw new BadRequestException('Total percentage must equal 100');
        }
        break;
      }
      default:
        throw new BadRequestException(`Split type ${expense.splitType} not supported yet`);
    }

    return splits;
  }
}
