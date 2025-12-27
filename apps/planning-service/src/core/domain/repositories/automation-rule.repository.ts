import { AutomationRule } from '../models/automation-rule.model';

export interface IAutomationRuleRepository {
  create(data: {
    userId: string;
    name: string;
    description?: string;
    triggerType: string;
    conditions: Record<string, unknown>;
    actionType: string;
    actionPayload: Record<string, unknown>;
  }): Promise<AutomationRule>;

  findById(id: string): Promise<AutomationRule | null>;

  findByUserId(userId: string): Promise<AutomationRule[]>;

  findActiveByTriggerType(triggerType: string): Promise<AutomationRule[]>;

  toggleActive(id: string, isActive: boolean): Promise<AutomationRule>;

  incrementExecutionCount(id: string): Promise<void>;

  delete(id: string): Promise<void>;
}
