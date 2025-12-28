export const RoutingKeys = {
  // User Routing Keys
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',

  // Notification Routing Keys
  NOTIFICATION_EMAIL: 'notification.email',
  NOTIFICATION_SMS: 'notification.sms',
  NOTIFICATION_PUSH: 'notification.push',

  // Expense Routing Keys
  EXPENSE_CREATED: 'expense.created',
  EXPENSE_UPDATED: 'expense.updated',
  EXPENSE_DELETED: 'expense.deleted',
};

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

export const Exchanges = {
  // User Exchange (Topic)
  USER: 'user.exchange',

  // Notification Exchange (Direct/Topic)
  NOTIFICATION: 'notification.exchange',

  // Expense Exchange (Topic)
  EXPENSE: 'expense.exchange',

  // Dead Letter Exchange
  DLX: 'dlx.exchange',
};
