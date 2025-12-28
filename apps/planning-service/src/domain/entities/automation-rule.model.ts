export enum TriggerType {
  EXPENSE_CREATED = 'EXPENSE_CREATED',
  INCOME_RECEIVED = 'INCOME_RECEIVED',
  BUDGET_THRESHOLD = 'BUDGET_THRESHOLD',
  GOAL_MILESTONE = 'GOAL_MILESTONE',
  SCHEDULED = 'SCHEDULED',
}

export enum ActionType {
  SEND_NOTIFICATION = 'SEND_NOTIFICATION',
  CONTRIBUTE_TO_GOAL = 'CONTRIBUTE_TO_GOAL',
  CREATE_BUDGET_ALERT = 'CREATE_BUDGET_ALERT',
  LOG_EVENT = 'LOG_EVENT',
}

export class AutomationRule {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly triggerType: TriggerType,
    public readonly conditions: Record<string, unknown>,
    public readonly actionType: ActionType,
    public readonly actionPayload: Record<string, unknown>,
    public readonly isActive: boolean,
    public readonly executionCount: number,
    public readonly lastExecutedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  matches(event: Record<string, unknown>): boolean {
    // Simple condition matching - can be extended
    for (const [key, value] of Object.entries(this.conditions)) {
      if (event[key] !== value) {
        return false;
      }
    }
    return true;
  }

  canExecute(): boolean {
    return this.isActive;
  }
}
