# @pfms/api-client

Type-safe HTTP client for inter-service communication with retry logic and circuit breaker pattern.

## Features

- ✅ Type-safe API calls
- ✅ Automatic retry with exponential backoff
- ✅ Circuit breaker pattern
- ✅ Request/response interceptors
- ✅ Configurable timeouts
- ✅ Error handling

## Installation

```bash
yarn add @pfms/api-client
```

## Usage

### Basic Usage

```typescript
import { ApiClient } from '@pfms/api-client';

const client = new ApiClient({
  baseURL: 'http://localhost:3003',
  timeout: 5000,
  retries: 3,
});

// GET request
const expenses = await client.get('/api/v2/expenses');

// POST request
const newExpense = await client.post('/api/v2/expenses', {
  amount: 50.0,
  currency: 'USD',
  description: 'Lunch',
});
```

### With Circuit Breaker

```typescript
const client = new ApiClient({
  baseURL: 'http://localhost:3003',
  circuitBreaker: {
    enabled: true,
    threshold: 5, // Open after 5 failures
    timeout: 60000, // Try again after 60 seconds
  },
});
```

### Type-Safe Requests

```typescript
interface Expense {
  id: string;
  amount: number;
  description: string;
}

const response = await client.get<Expense[]>('/api/v2/expenses');
console.log(response.data); // Type: Expense[]
```

## License

MIT
