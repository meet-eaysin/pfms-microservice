# @pfms/saga-orchestrator

Orchestration-based saga pattern for distributed transactions in PFMS microservices.

## Features

- ✅ Orchestration-based saga pattern
- ✅ State persistence (Redis or in-memory)
- ✅ Automatic compensation (rollback)
- ✅ Timeout management for saga steps
- ✅ Step execution tracking
- ✅ TypeScript type safety

## Installation

```bash
yarn add @pfms/saga-orchestrator
```

## Usage

### Create a Saga

```typescript
import { SagaCoordinator } from '@pfms/saga-orchestrator';

export class CreateExpenseSaga extends SagaCoordinator {
  constructor(
    config,
    private expenseService,
    private budgetService
  ) {
    super(config);
  }

  async execute(command) {
    const sagaId = this.generateSagaId();

    await this.stateManager.initializeState(sagaId, { command });

    try {
      // Step 1: Create expense
      const expense = await this.executeStep(
        sagaId,
        'create-expense',
        () => this.expenseService.create(command),
        () => this.expenseService.delete(expense.id),
        5000
      );

      // Step 2: Update budget
      await this.executeStep(
        sagaId,
        'update-budget',
        () => this.budgetService.deduct(command.amount),
        () => this.budgetService.refund(command.amount),
        3000
      );

      await this.completeSaga(sagaId);
      return expense;
    } catch (error) {
      await this.compensate(sagaId);
      throw error;
    }
  }
}
```

## License

MIT
