import { Inject, Injectable } from '@nestjs/common';
import { IAutomationRuleRepository } from '../../../domain/interfaces/automation-rule.repository';
import {
  AutomationRule,
  TriggerType,
  ActionType,
} from '../../../domain/entities/automation-rule.model';

export interface CreateRuleCommand {
  userId: string;
  name: string;
  description?: string;
  triggerType: TriggerType;
  conditions: Record<string, unknown>;
  actionType: ActionType;
  actionPayload: Record<string, unknown>;
}

@Injectable()
export class CreateRuleUseCase {
  constructor(
    @Inject('IAutomationRuleRepository')
    private readonly ruleRepository: IAutomationRuleRepository
  ) {}

  async execute(command: CreateRuleCommand): Promise<AutomationRule> {
    return this.ruleRepository.create({
      userId: command.userId,
      name: command.name,
      description: command.description,
      triggerType: command.triggerType,
      conditions: command.conditions,
      actionType: command.actionType,
      actionPayload: command.actionPayload,
    });
  }
}
