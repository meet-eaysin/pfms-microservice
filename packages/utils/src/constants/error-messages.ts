// ============================================
// ERROR MESSAGES WITH CODES AND STATUS
// ============================================

export const ErrorMessages = {
  // Authentication
  INVALID_CREDENTIALS: {
    code: 'AUTH_001',
    message: 'Invalid email or password',
    statusCode: 401,
  },
  UNAUTHORIZED: {
    code: 'AUTH_002',
    message: 'You are not authorized to perform this action',
    statusCode: 403,
  },
  TOKEN_EXPIRED: {
    code: 'AUTH_003',
    message: 'Your session has expired. Please login again',
    statusCode: 401,
  },
  TOKEN_INVALID: {
    code: 'AUTH_004',
    message: 'Invalid authentication token',
    statusCode: 401,
  },
  EMAIL_NOT_VERIFIED: {
    code: 'AUTH_005',
    message: 'Email not verified. Please verify your email first',
    statusCode: 403,
  },
  MFA_REQUIRED: {
    code: 'AUTH_006',
    message: 'Multi-factor authentication required',
    statusCode: 403,
  },

  // Validation
  VALIDATION_FAILED: {
    code: 'VAL_001',
    message: 'Validation failed',
    statusCode: 400,
  },
  REQUIRED_FIELD: {
    code: 'VAL_002',
    message: 'This field is required: {field}',
    statusCode: 400,
  },
  INVALID_EMAIL: {
    code: 'VAL_003',
    message: 'Invalid email address',
    statusCode: 400,
  },
  INVALID_PHONE: {
    code: 'VAL_004',
    message: 'Invalid phone number',
    statusCode: 400,
  },
  INVALID_AMOUNT: {
    code: 'VAL_005',
    message: 'Invalid amount. Amount must be positive',
    statusCode: 400,
  },
  INVALID_DATE: {
    code: 'VAL_006',
    message: 'Invalid date format',
    statusCode: 400,
  },
  DUPLICATE_EMAIL: {
    code: 'VAL_007',
    message: 'Email already registered',
    statusCode: 409,
  },

  // Resources
  NOT_FOUND: {
    code: 'NOT_001',
    message: 'Resource not found',
    statusCode: 404,
  },
  USER_NOT_FOUND: {
    code: 'NOT_002',
    message: 'User not found',
    statusCode: 404,
  },
  EXPENSE_NOT_FOUND: {
    code: 'NOT_003',
    message: 'Expense not found',
    statusCode: 404,
  },
  LOAN_NOT_FOUND: {
    code: 'NOT_004',
    message: 'Loan not found',
    statusCode: 404,
  },
  ALREADY_EXISTS: {
    code: 'RES_001',
    message: 'Resource already exists',
    statusCode: 409,
  },
  CANNOT_DELETE: {
    code: 'RES_002',
    message: 'Cannot delete this resource',
    statusCode: 400,
  },

  // Business Logic
  INSUFFICIENT_BALANCE: {
    code: 'BUS_001',
    message: 'Insufficient balance for this transaction',
    statusCode: 400,
  },
  BUDGET_EXCEEDED: {
    code: 'BUS_002',
    message: 'Budget limit exceeded',
    statusCode: 400,
  },
  LOAN_ALREADY_PAID: {
    code: 'BUS_003',
    message: 'Loan has already been paid off',
    statusCode: 400,
  },
  EMI_OVERDUE: {
    code: 'BUS_004',
    message: 'EMI payment is overdue',
    statusCode: 400,
  },
  INVALID_SPLIT: {
    code: 'BUS_005',
    message: 'Invalid expense split. Total must equal 100%',
    statusCode: 400,
  },

  // Server
  INTERNAL_ERROR: {
    code: 'SYS_001',
    message: 'An internal server error occurred',
    statusCode: 500,
  },
  SERVICE_UNAVAILABLE: {
    code: 'SYS_002',
    message: 'Service temporarily unavailable',
    statusCode: 503,
  },
  DATABASE_ERROR: {
    code: 'SYS_003',
    message: 'Database operation failed',
    statusCode: 500,
  },

  // Rate Limiting
  TOO_MANY_REQUESTS: {
    code: 'RATE_001',
    message: 'Too many requests. Please try again later',
    statusCode: 429,
  },
} as const;
