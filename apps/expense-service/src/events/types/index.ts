import { BaseEvent } from '@pfms/event-bus';
import { UUID } from '@pfms/types';
import { randomUUID } from 'crypto';

/**
 * User Created Event
 * Published by user-service when a new user is created
 */
export interface UserCreatedEventData {
  userId: UUID;
  email: string;
  firstName: string;
  lastName: string;
  [key: string]: unknown;
}

export interface UserCreatedEvent extends BaseEvent {
  eventType: 'user.created';
  data: UserCreatedEventData;
}

/**
 * Helper function to create a UserCreatedEvent
 */
export function createUserCreatedEvent(
  data: UserCreatedEventData,
  metadata?: { correlationId?: string; causationId?: string }
): UserCreatedEvent {
  return {
    eventId: randomUUID(),
    eventType: 'user.created',
    timestamp: new Date().toISOString(),
    version: '1.0',
    data,
    metadata,
  };
}

/**
 * Expense Created Event
 * Published when a new expense is created
 */
export interface ExpenseCreatedEventData {
  expenseId: UUID;
  userId: UUID;
  amount: number;
  currency: string;
  description: string;
  category: string;
  date: string;
  [key: string]: unknown;
}

export interface ExpenseCreatedEvent extends BaseEvent {
  eventType: 'expense.created';
  data: ExpenseCreatedEventData;
}

/**
 * Helper function to create an ExpenseCreatedEvent
 */
export function createExpenseCreatedEvent(
  data: ExpenseCreatedEventData,
  metadata?: { correlationId?: string; causationId?: string; userId?: string }
): ExpenseCreatedEvent {
  return {
    eventId: randomUUID(),
    eventType: 'expense.created',
    timestamp: new Date().toISOString(),
    version: '1.0',
    data,
    metadata,
  };
}

/**
 * Expense Updated Event
 * Published when an expense is updated
 */
export interface ExpenseUpdatedEventData {
  expenseId: UUID;
  userId: UUID;
  amount?: number;
  currency?: string;
  description?: string;
  category?: string;
  date?: string;
  [key: string]: unknown;
}

export interface ExpenseUpdatedEvent extends BaseEvent {
  eventType: 'expense.updated';
  data: ExpenseUpdatedEventData;
}

/**
 * Helper function to create an ExpenseUpdatedEvent
 */
export function createExpenseUpdatedEvent(
  data: ExpenseUpdatedEventData,
  metadata?: { correlationId?: string; causationId?: string; userId?: string }
): ExpenseUpdatedEvent {
  return {
    eventId: randomUUID(),
    eventType: 'expense.updated',
    timestamp: new Date().toISOString(),
    version: '1.0',
    data,
    metadata,
  };
}

/**
 * Expense Deleted Event
 * Published when an expense is deleted
 */
export interface ExpenseDeletedEventData {
  expenseId: UUID;
  userId: UUID;
  [key: string]: unknown;
}

export interface ExpenseDeletedEvent extends BaseEvent {
  eventType: 'expense.deleted';
  data: ExpenseDeletedEventData;
}

/**
 * Helper function to create an ExpenseDeletedEvent
 */
export function createExpenseDeletedEvent(
  data: ExpenseDeletedEventData,
  metadata?: { correlationId?: string; causationId?: string; userId?: string }
): ExpenseDeletedEvent {
  return {
    eventId: randomUUID(),
    eventType: 'expense.deleted',
    timestamp: new Date().toISOString(),
    version: '1.0',
    data,
    metadata,
  };
}
