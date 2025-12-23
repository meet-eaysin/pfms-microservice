export const Queues = {
  // User Queues
  USER_CREATED: 'user.created.queue',
  USER_UPDATED: 'user.updated.queue',
  USER_DELETED: 'user.deleted.queue',
  USER_SYNC: 'user.sync.queue',

  // Notification Queues
  NOTIFICATION_EMAIL: 'notification.email.queue',
  NOTIFICATION_SMS: 'notification.sms.queue',
  NOTIFICATION_PUSH: 'notification.push.queue',

  // Expense Queues
  EXPENSE_CREATED: 'expense.created.queue',
  EXPENSE_UPDATED: 'expense.updated.queue',
  EXPENSE_DELETED: 'expense.deleted.queue',

  // Dead Letter Queue
  DLQ: 'dlq.queue',
};
