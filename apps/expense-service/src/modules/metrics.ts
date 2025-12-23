/**
 * Metrics Module for Expense Service
 * Prometheus metrics collection and exposure
 */

import { register, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

// Initialize default metrics (CPU, memory, etc.)
collectDefaultMetrics({ register, prefix: 'expense_service_' });

// HTTP Metrics
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status_code', 'service'],
  registers: [register],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in milliseconds',
  labelNames: ['method', 'path', 'status_code', 'service'],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
  registers: [register],
});

// Expense-specific Metrics
export const expenseCreatedTotal = new Counter({
  name: 'expense_created_total',
  help: 'Total number of expenses created',
  labelNames: ['service'],
  registers: [register],
});

export const expenseUpdatedTotal = new Counter({
  name: 'expense_updated_total',
  help: 'Total number of expenses updated',
  labelNames: ['service'],
  registers: [register],
});

export const expenseDeletedTotal = new Counter({
  name: 'expense_deleted_total',
  help: 'Total number of expenses deleted',
  labelNames: ['service'],
  registers: [register],
});

export const expenseAmountHistogram = new Histogram({
  name: 'expense_amount',
  help: 'Distribution of expense amounts',
  labelNames: ['currency', 'category', 'service'],
  buckets: [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000],
  registers: [register],
});

export const totalExpensesGauge = new Gauge({
  name: 'total_expenses',
  help: 'Total number of expenses in the system',
  labelNames: ['service'],
  registers: [register],
});

export const expensesByCategory = new Gauge({
  name: 'expenses_by_category',
  help: 'Number of expenses by category',
  labelNames: ['category', 'service'],
  registers: [register],
});

/**
 * Get all metrics in Prometheus format
 */
export async function getMetrics(): Promise<string> {
  return register.metrics();
}

/**
 * Get metrics content type
 */
export function getContentType(): string {
  return register.contentType;
}

/**
 * Record HTTP request
 */
export function recordHttpRequest(
  method: string,
  path: string,
  statusCode: number,
  duration: number
) {
  httpRequestsTotal.inc({
    method,
    path,
    status_code: statusCode.toString(),
    service: 'expense',
  });

  httpRequestDuration.observe(
    {
      method,
      path,
      status_code: statusCode.toString(),
      service: 'expense',
    },
    duration
  );
}

/**
 * Record expense creation
 */
export function recordExpenseCreated(amount: number, currency: string, category: string) {
  expenseCreatedTotal.inc({ service: 'expense' });
  expenseAmountHistogram.observe({ currency, category, service: 'expense' }, amount);
}

/**
 * Record expense update
 */
export function recordExpenseUpdated() {
  expenseUpdatedTotal.inc({ service: 'expense' });
}

/**
 * Record expense deletion
 */
export function recordExpenseDeleted() {
  expenseDeletedTotal.inc({ service: 'expense' });
}

/**
 * Update total expenses count
 */
export function updateTotalExpenses(count: number) {
  totalExpensesGauge.set({ service: 'expense' }, count);
}

/**
 * Update expenses by category
 */
export function updateExpensesByCategory(category: string, count: number) {
  expensesByCategory.set({ category, service: 'expense' }, count);
}

/**
 * Normalize URL path by removing IDs and query parameters
 */
export function normalizePath(url: string): string {
  // Remove query parameters
  const pathWithoutQuery = url.split('?')[0] || '/';

  // Replace UUIDs and numeric IDs with :id
  return pathWithoutQuery
    .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id')
    .replace(/\/\d+/g, '/:id');
}
