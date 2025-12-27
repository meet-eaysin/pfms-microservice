import { Injectable } from '@nestjs/common';
import {
  Prisma,
  AutomationRule as PrismaAutomationRule,
  TriggerType as PrismaTriggerType,
  ActionType as PrismaActionType,
} from '@prisma/client';
import { IAutomationRuleRepository } from '../../../core/domain/repositories/automation-rule.repository';
import {
  AutomationRule,
  TriggerType,
  ActionType,
} from '../../../core/domain/models/automation-rule.model';
import { PrismaService } from '../prisma.service';

const mapTriggerType = (t: PrismaTriggerType): TriggerType => {
  switch (t) {
    case 'EXPENSE_CREATED':
      return TriggerType.EXPENSE_CREATED;
    case 'INCOME_RECEIVED':
      return TriggerType.INCOME_RECEIVED;
    case 'BUDGET_THRESHOLD':
      return TriggerType.BUDGET_THRESHOLD;
    case 'GOAL_MILESTONE':
      return TriggerType.GOAL_MILESTONE;
    case 'SCHEDULED':
      return TriggerType.SCHEDULED;
  }
};

const mapActionType = (a: PrismaActionType): ActionType => {
  switch (a) {
    case 'SEND_NOTIFICATION':
      return ActionType.SEND_NOTIFICATION;
    case 'CONTRIBUTE_TO_GOAL':
      return ActionType.CONTRIBUTE_TO_GOAL;
    case 'CREATE_BUDGET_ALERT':
      return ActionType.CREATE_BUDGET_ALERT;
    case 'LOG_EVENT':
      return ActionType.LOG_EVENT;
  }
};

const mapToPrismaTriggerType = (t: TriggerType): PrismaTriggerType => {
  switch (t) {
    case TriggerType.EXPENSE_CREATED:
      return 'EXPENSE_CREATED';
    case TriggerType.INCOME_RECEIVED:
      return 'INCOME_RECEIVED';
    case TriggerType.BUDGET_THRESHOLD:
      return 'BUDGET_THRESHOLD';
    case TriggerType.GOAL_MILESTONE:
      return 'GOAL_MILESTONE';
    case TriggerType.SCHEDULED:
      return 'SCHEDULED';
  }
};

const mapToPrismaActionType = (a: ActionType): PrismaActionType => {
  switch (a) {
    case ActionType.SEND_NOTIFICATION:
      return 'SEND_NOTIFICATION';
    case ActionType.CONTRIBUTE_TO_GOAL:
      return 'CONTRIBUTE_TO_GOAL';
    case ActionType.CREATE_BUDGET_ALERT:
      return 'CREATE_BUDGET_ALERT';
    case ActionType.LOG_EVENT:
      return 'LOG_EVENT';
  }
};

@Injectable()
export class PrismaAutomationRuleRepository implements IAutomationRuleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId: string;
    name: string;
    description?: string;
    triggerType: string;
    conditions: Record<string, unknown>;
    actionType: string;
    actionPayload: Record<string, unknown>;
  }): Promise<AutomationRule> {
    const rule = await this.prisma.automationRule.create({
      data: {
        userId: data.userId,
        name: data.name,
        description: data.description || null,
        triggerType: mapToPrismaTriggerType(data.triggerType as TriggerType),
        conditions: data.conditions as Prisma.InputJsonValue,
        actionType: mapToPrismaActionType(data.actionType as ActionType),
        actionPayload: data.actionPayload as Prisma.InputJsonValue,
      },
    });
    return this.toDomain(rule);
  }

  async findById(id: string): Promise<AutomationRule | null> {
    const rule = await this.prisma.automationRule.findUnique({ where: { id } });
    return rule ? this.toDomain(rule) : null;
  }

  async findByUserId(userId: string): Promise<AutomationRule[]> {
    const rules = await this.prisma.automationRule.findMany({ where: { userId } });
    return rules.map((r) => this.toDomain(r));
  }

  async findActiveByTriggerType(triggerType: string): Promise<AutomationRule[]> {
    const rules = await this.prisma.automationRule.findMany({
      where: {
        triggerType: mapToPrismaTriggerType(triggerType as TriggerType),
        isActive: true,
      },
    });
    return rules.map((r) => this.toDomain(r));
  }

  async toggleActive(id: string, isActive: boolean): Promise<AutomationRule> {
    const rule = await this.prisma.automationRule.update({
      where: { id },
      data: { isActive },
    });
    return this.toDomain(rule);
  }

  async incrementExecutionCount(id: string): Promise<void> {
    await this.prisma.automationRule.update({
      where: { id },
      data: {
        executionCount: { increment: 1 },
        lastExecutedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.automationRule.delete({ where: { id } });
  }

  private toDomain(rule: PrismaAutomationRule): AutomationRule {
    return new AutomationRule(
      rule.id,
      rule.userId,
      rule.name,
      rule.description,
      mapTriggerType(rule.triggerType),
      rule.conditions as Record<string, unknown>,
      mapActionType(rule.actionType),
      rule.actionPayload as Record<string, unknown>,
      rule.isActive,
      rule.executionCount,
      rule.lastExecutedAt,
      rule.createdAt,
      rule.updatedAt
    );
  }
}
