# @pfms/event-bus

RabbitMQ-based event bus for PFMS microservices architecture.

## Features

- ✅ Type-safe event publishing and subscribing
- ✅ Topic-based routing with RabbitMQ exchanges
- ✅ Durable queues for message persistence
- ✅ Dead letter queues for failed messages
- ✅ Automatic retry with exponential backoff
- ✅ Acknowledgment-based delivery
- ✅ Event versioning support
- ✅ Decorators for easy subscription

## Installation

```bash
yarn add @pfms/event-bus
```

## Usage

### Initialize Event Bus

```typescript
import { RabbitMQEventBus } from '@pfms/event-bus';

const eventBus = new RabbitMQEventBus({
  rabbitmq: {
    host: process.env.RABBITMQ_HOST || 'localhost',
    port: parseInt(process.env.RABBITMQ_PORT || '5672'),
    username: process.env.RABBITMQ_USER || 'guest',
    password: process.env.RABBITMQ_PASS || 'guest',
  },
  serviceName: 'expense-service',
  prefetchCount: 10,
});

await eventBus.connect();
```

### Publish Events

```typescript
await eventBus.publish('transaction.expense.created', {
  eventId: randomUUID(),
  eventType: 'transaction.expense.created',
  timestamp: new Date().toISOString(),
  version: '1.0',
  data: {
    expenseId: '123',
    userId: 'user-456',
    amount: 100,
    currency: 'USD',
  },
});
```

### Subscribe to Events

```typescript
await eventBus.subscribe('transaction.expense.created', async (event) => {
  console.log('Expense created:', event.data.expenseId);
  // Handle event
});
```

## License

MIT
