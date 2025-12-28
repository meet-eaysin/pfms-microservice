import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQEventBus, BaseEvent } from '@pfms/event-bus';
import { IAutomationRuleRepository } from '../../domain/interfaces/automation-rule.repository';
import { AutomationRule } from '../../domain/entities/automation-rule.model';
import { Inject } from '@nestjs/common';

@Injectable()
export class PlanningEventHandler implements OnModuleInit {
  constructor(
    private readonly eventBus: RabbitMQEventBus,
    @Inject('IAutomationRuleRepository')
    private readonly ruleRepository: IAutomationRuleRepository
  ) {}

  async onModuleInit() {
    await this.eventBus.subscribe('expense.created', this.handleExpenseCreated.bind(this));
    await this.eventBus.subscribe('income.received', this.handleIncomeReceived.bind(this));
    console.log('✅ Planning event handlers registered');
  }

  private async handleExpenseCreated(event: BaseEvent): Promise<void> {
    console.log('📝 Planning service received expense.created:', event.eventId);

    // Find active rules for EXPENSE_CREATED trigger
    const rules = await this.ruleRepository.findActiveByTriggerType('EXPENSE_CREATED');

    for (const rule of rules) {
      if (rule.matches(event.data)) {
        console.log(`🎯 Rule matched: ${rule.name}`);
        await this.executeRule(rule, event);
      }
    }
  }

  private async handleIncomeReceived(event: BaseEvent): Promise<void> {
    console.log('📝 Planning service received income.received:', event.eventId);

    // Find active rules for INCOME_RECEIVED trigger
    const rules = await this.ruleRepository.findActiveByTriggerType('INCOME_RECEIVED');

    for (const rule of rules) {
      if (rule.matches(event.data)) {
        console.log(`🎯 Rule matched: ${rule.name}`);
        await this.executeRule(rule, event);
      }
    }
  }

  private async executeRule(rule: AutomationRule, event: BaseEvent): Promise<void> {
    try {
      // Execute rule action based on actionType
      switch (rule.actionType) {
        case 'SEND_NOTIFICATION':
          console.log(`📧 Would send notification: ${JSON.stringify(rule.actionPayload)}`);
          // TODO: Integrate with notification service
          break;

        case 'CONTRIBUTE_TO_GOAL':
          console.log(`💰 Would contribute to goal: ${JSON.stringify(rule.actionPayload)}`);
          // TODO: Implement auto-contribution
          break;

        case 'CREATE_BUDGET_ALERT':
          console.log(`⚠️ Would create budget alert: ${JSON.stringify(rule.actionPayload)}`);
          break;

        case 'LOG_EVENT':
          console.log(`📋 Logging event: ${event.eventType}`);
          break;

        default:
          console.log(`❓ Unknown action type: ${rule.actionType}`);
      }

      // Increment execution count
      await this.ruleRepository.incrementExecutionCount(rule.id);
    } catch (error) {
      console.error(`❌ Failed to execute rule ${rule.name}:`, error);
    }
  }
}
