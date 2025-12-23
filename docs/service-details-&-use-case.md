### **1. Auth Service - Port 3001**

### **Authentication Endpoints**

**Register**

```jsx
POST   /api/v1/auth/register
Body: {
  email: string (required),
  password: string (required, min 8 chars),
  firstName: string (required),
  lastName: string (optional),
  phone: string (optional),
  currency: string (optional, default: "USD"),
  timezone: string (optional, default: "UTC")
}
Response: {
  user: { id, email, firstName, lastName },
  accessToken: string,
  refreshToken: string
}
Calls: User Service (create profile)
Publishes: user.created event
```

**Login**

```jsx
POST   /api/v1/auth/login
Body: { email: string, password: string }
Response: { user, accessToken, refreshToken }
Calls: User Service (update last login)
```

**Logout**

```jsx
POST   /api/v1/auth/logout
Headers: { Authorization: Bearer {token} }
Response: { success: true }
Calls: Redis (blacklist token)
```

**Refresh Token**

```jsx
POST   /api/v1/auth/refresh
Body: { refreshToken: string }
Response: { accessToken, refreshToken }
Calls: Validate refresh token, blacklist old tokens
```

**Forgot Password**

```jsx
POST   /api/v1/auth/forgot-password
Body: { email: string }
Response: { message: "Reset link sent" }
Calls: Notification Service (send reset email)
```

**Reset Password**

```jsx
POST   /api/v1/auth/reset-password
Body: { token: string, newPassword: string }
Response: { success: true }
Calls: Notification Service (send confirmation)
```

**Email Verification**

```jsx
POST / api / v1 / auth / verify - email;
Body: {
  token: string;
}
Response: {
  success: true;
}
```

**Resend Verification**

```jsx
POST   /api/v1/auth/resend-verification
Body: { email: string }
Response: { message: "Verification email sent" }
Calls: Notification Service
```

### **OAuth Endpoints**

**Google OAuth**

```jsx
GET    /api/v1/auth/oauth/google
Redirect to Google OAuth

GET    /api/v1/auth/oauth/google/callback
Query: { code: string }
Response: { user, accessToken, refreshToken }
Calls: User Service (create/update user)
```

**Facebook OAuth**

```jsx
GET    /api/v1/auth/oauth/facebook
Redirect to Facebook OAuth

GET    /api/v1/auth/oauth/facebook/callback
Query: { code: string }
Response: { user, accessToken, refreshToken }
```

**Apple OAuth**

```jsx
GET    /api/v1/auth/oauth/apple
Redirect to Apple OAuth

GET    /api/v1/auth/oauth/apple/callback
Query: { code: string }
Response: { user, accessToken, refreshToken }
```

### **MFA Endpoints**

**Enable MFA**

```jsx
POST   /api/v1/auth/mfa/enable
Body: { method: "totp" | "sms" }
Response: { secret: string, qrCode: string (for TOTP) }
Calls: Notification Service (send SMS code if SMS)
```

**Verify MFA Setup**

```jsx
POST   /api/v1/auth/mfa/verify
Body: { code: string }
Response: { success: true, backupCodes: [] }
```

**Disable MFA**

```jsx
POST   /api/v1/auth/mfa/disable
Body: { code: string (current MFA code) }
Response: { success: true }
```

**Get Backup Codes**

```jsx
GET / api / v1 / auth / mfa / backup - codes;
Response: {
  codes: [];
}
```

**Regenerate Backup Codes**

```jsx
POST / api / v1 / auth / mfa / regenerate - backup - codes;
Response: {
  codes: [];
}
```

### **Session Management**

**List Active Sessions**

```jsx
GET / api / v1 / auth / sessions;
Response: {
  sessions: [];
}
```

**Revoke Session**

```jsx
DELETE /api/v1/auth/sessions/:sessionId
Response: { success: true }
```

**Revoke All Sessions**

```jsx
DELETE /api/v1/auth/sessions/all
Response: { success: true }
Calls: Notification Service (alert user)
```

**Device Management**

```jsx
GET    /api/v1/auth/devices
Response: { devices: [] }

DELETE /api/v1/auth/devices/:deviceId
Response: { success: true }
```

### **Internal APIs**

**Validate Token (Internal)**

```jsx
POST   /api/v1/auth/validate
Body: { token: string }
Response: { valid: boolean, userId: string, email: string }
[Called by other services via internal network]
```

**Get User by Token (Internal)**

```jsx
GET    /api/v1/auth/user
Headers: { Authorization: Bearer {token} }
Response: { user: { id, email, isActive, emailVerified } }
[Internal use by API Gateway]
```

### **2. User Service - Port 3002**

### **Profile Management**

**Get Profile**

```coffeescript
GET    /api/v1/user/profile
Response: {
  id: string,
  email: string,
  firstName: string,
  lastName: string,
  phone: string,
  avatar: string,
  dateOfBirth: string,
  currency: string,
  timezone: string,
  language: string,
  createdAt: string,
  updatedAt: string
}
```

**Update Profile**

```coffeescript
PUT    /api/v1/user/profile
Body: {
  firstName: string,
  lastName: string,
  phone: string,
  dateOfBirth: string,
  avatar: string
}
Response: { user }
```

**Update Avatar**

```coffeescript
PATCH  /api/v1/user/profile/avatar
Body: FormData { avatar: File }
Response: { avatarUrl: string }
Calls: Report Service (upload to S3)
```

**Remove Avatar**

```coffeescript
DELETE /api/v1/user/profile/avatar
Response: { success: true }
```

### **Preferences**

**Get Preferences**

```coffeescript
GET    /api/v1/user/preferences
Response: {
  currency: string,
  timezone: string,
  language: string,
  financial: { ... }
}
```

**Update Preferences**

```coffeescript
PUT    /api/v1/user/preferences
Body: { currency: string, timezone: string, language: string }
Response: { preferences }
```

**Get Financial Preferences**

```jsx
GET    /api/v1/user/preferences/financial
Response: {
  dailyBudgetLimit: number,
  monthlyBudgetLimit: number,
  savingsTarget: number,
  investmentRiskLevel: string,
  salaryDay: number,
  earningSchedule: string
}
```

**Update Financial Preferences**

```coffeescript
PUT    /api/v1/user/preferences/financial
Body: {
  dailyBudgetLimit: number,
  monthlyBudgetLimit: number,
  investmentRiskLevel: "low"|"medium"|"high",
  salaryDay: number,
  earningSchedule: "monthly"|"weekly"|"biweekly"
}
Response: { preferences }
Calls: Automation Service (trigger budget alerts)
```

### **Privacy Settings**

**Get Privacy Settings**

```coffeescript
GET    /api/v1/user/privacy
Response: {
  profileVisibility: "public"|"private"|"friends",
  showNetWorth: boolean,
  allowAnalytics: boolean,
  dataSharing: boolean
}
```

**Update Privacy Settings**

```coffeescript
PUT    /api/v1/user/privacy
Body: {
  profileVisibility: string,
  showNetWorth: boolean,
  dataSharing: boolean
}
Response: { privacy }
```

### **Notification Preferences**

**Get Notification Preferences**

```coffeescript
GET    /api/v1/user/notifications/preferences
Response: {
  channels: [
    { channel: "push", category: "expense", enabled: true },
    { channel: "email", category: "investment", enabled: false },
    ...
  ]
}
```

**Update Notification Preference**

```jsx
PUT    /api/v1/user/notifications/preferences
Body: { channel: string, category: string, enabled: boolean }
Response: { preferences }
Calls: Notification Service (update preferences)
```

**Batch Update Notifications**

```jsx
POST / api / v1 / user / notifications / preferences / batch;
Body: {
  preferences: [];
}
Response: {
  updated: count;
}
```

### **Family Members**

**List Family Members**

```jsx
GET / api / v1 / user / family;
Response: {
  members: [
    {
      id: string,
      userId: string,
      relation: string,
      role: string,
      joinedAt: string,
    },
  ];
}
```

**Invite Family Member**

```jsx
POST   /api/v1/user/family/invite
Body: { email: string, role: "admin"|"contributor"|"viewer" }
Response: { invitation: { id, token, expiresAt } }
Calls: Notification Service (send invite)
```

**Accept Family Invitation**

```jsx
POST / api / v1 / user / family / accept - invite;
Body: {
  token: string;
}
Response: {
  success: true;
}
```

**Update Member Role**

```jsx
PUT    /api/v1/user/family/:memberId/role
Body: { role: string }
Response: { member }
```

**Remove Family Member**

```jsx
DELETE /api/v1/user/family/:memberId
Response: { success: true }
```

### **Account Management**

**Deactivate Account**

```jsx
POST   /api/v1/user/account/deactivate
Body: { reason: string }
Response: { success: true }
Calls: All services (deactivate user data)
```

**Reactivate Account**

```jsx
POST / api / v1 / user / account / reactivate;
Response: {
  success: true;
}
```

**Delete Account**

```jsx
DELETE /api/v1/user/account
Body: { password: string, confirmation: "DELETE MY ACCOUNT" }
Response: { success: true }
Calls: All services (cascade delete user data)
```

### **Internal APIs**

**Search Users**

```jsx
GET    /api/v1/user/search
Query: { q: string, limit: number, offset: number }
Response: { users: [] }
[Called by Group Service, Loan Service]
```

**Get User by ID**

```jsx
GET    /api/v1/user/by-id/:userId
Response: { user: { id, email, firstName, lastName, avatar } }
[Called by other services]
```

**Batch Get Users**

```jsx
POST   /api/v1/user/by-ids
Body: { userIds: [] }
Response: { users: [] }
[Called by other services]
```

### **3. Expense Service - Port 3003**

**Create Expense**

```coffeescript
POST   /api/v1/expenses
Body: {
  amount: number (required),
  currency: string (default: "USD"),
  categoryId: string,
  description: string,
  date: string (ISO date, default: today),
  time: string (optional),
  tags: string[],
  location: { lat: number, lng: number, address: string },
  paymentMethod: string,
  attachments: string[]
}
Response: { expense }
Publishes: expense.created event
Calls: AI Service (auto-categorization if no category)
```

**List Expenses**

```coffeescript
GET    /api/v1/expenses
Query: {
  startDate: string,
  endDate: string,
  categoryId: string,
  tags: string[],
  minAmount: number,
  maxAmount: number,
  limit: number (default: 50),
  offset: number (default: 0),
  sortBy: "date"|"amount"|"createdAt",
  sortOrder: "asc"|"desc"
}
Response: {
  expenses: [],
  total: number,
  page: number,
  pages: number
}
```

**Get Expense**

```coffeescript
GET    /api/v1/expenses/:id
Response: { expense }
```

**Update Expense**

```coffeescript
PUT    /api/v1/expenses/:id
Body: { amount, categoryId, description, date, tags, ... }
Response: { expense }
Publishes: expense.updated event
```

**Delete Expense**

```coffeescript
DELETE /api/v1/expenses/:id
Response: { success: true }
Publishes: expense.deleted event
```

**Update Category Only**

```coffeescript
PATCH  /api/v1/expenses/:id/category
Body: { categoryId: string }
Response: { expense }
```

### **Bulk Operations**

**Bulk Create**

```coffeescript
POST   /api/v1/expenses/bulk
Body: { expenses: [] }
Response: { created: count, failed: [] }
```

**Bulk Import**

```coffeescript
POST   /api/v1/expenses/bulk-import
Body: FormData { file: CSV/Excel file }
Response: { jobId: string, status: "processing" }
Calls: Job Queue (Bull)
```

**Check Import Status**

```coffeescript
GET    /api/v1/expenses/bulk-import/:jobId
Response: {
  status: "processing"|"completed"|"failed",
  progress: number,
  results: { imported: number, failed: [] }
}
```

**Bulk Delete**

```coffeescript
POST   /api/v1/expenses/bulk-delete
Body: { expenseIds: [] }
Response: { deleted: count }
```

**Bulk Update**

```coffeescript
PUT    /api/v1/expenses/bulk-update
Body: { expenseIds: [], updates: {} }
Response: { updated: count }
```

### **Voice & Quick Entry**

**Voice Entry**

```coffeescript
POST   /api/v1/expenses/voice
Body: FormData { audio: File }
Response: { expense, confidence: number }
Calls: AI Service (speech-to-text + NLP)
```

**Quick Add**

```coffeescript
POST   /api/v1/expenses/quick-add
Body: { text: string }
Response: { expense }
Calls: AI Service (text parsing)
```

### **Categories**

**List Categories**

```coffeescript
GET    /api/v1/expenses/categories
Response: { categories: [] }
```

**Create Category**

```coffeescript
POST   /api/v1/expenses/categories
Body: {
  name: string (required),
  icon: string,
  color: string,
  parentCategoryId: string
}
Response: { category }
```

**Update Category**

```coffeescript
PUT    /api/v1/expenses/categories/:id
Body: { name, icon, color }
Response: { category }
```

**Delete Category**

```coffeescript
DELETE /api/v1/expenses/categories/:id
Response: { success: true }
```

**Get Category Tree**

```coffeescript
GET    /api/v1/expenses/categories/tree
Response: { tree: [] }
```

### **Recurring Expenses**

**List Recurring Expenses**

```coffeescript
GET    /api/v1/expenses/recurring
Response: { recurringExpenses: [] }
```

**Create Recurring Expense**

```coffeescript
POST   /api/v1/expenses/recurring
Body: {
  name: string (required),
  amount: number (required),
  frequency: "daily"|"weekly"|"monthly"|"yearly",
  startDate: string (required),
  endDate: string,
  categoryId: string,
  autoPay: boolean,
  reminderDays: number,
  inflationRate: number
}
Response: { recurringExpense }
Calls: Automation Service (create reminder rule)
```

**Get Recurring Expense**

```coffeescript
GET    /api/v1/expenses/recurring/:id
Response: { recurringExpense }
```

**Update Recurring Expense**

```coffeescript
PUT    /api/v1/expenses/recurring/:id
Body: { amount, frequency, ... }
Response: { recurringExpense }
```

**Delete Recurring Expense**

```coffeescript
DELETE /api/v1/expenses/recurring/:id
Response: { success: true }
```

**Skip Next Occurrence**

```coffeescript
POST   /api/v1/expenses/recurring/:id/skip
Body: { date: string }
Response: { success: true }
```

**Manually Pay Recurring Expense**

```coffeescript
POST   /api/v1/expenses/recurring/:id/pay
Body: { date: string }
Response: { expense }
```

**Get Upcoming Recurring Expenses**

```coffeescript
GET    /api/v1/expenses/recurring/upcoming
Query: { days: number (default: 30) }
Response: { upcoming: [] }
```

### **Subscriptions**

**List Subscriptions**

```coffeescript
GET    /api/v1/expenses/subscriptions
Response: { subscriptions: [] }
```

**Create Subscription**

```coffeescript
POST   /api/v1/expenses/subscriptions
Body: {
  name: string,
  amount: number,
  renewalDate: string,
  frequency: "monthly"|"yearly"|"quarterly",
  categoryId: string,
  autoRenew: boolean
}
Response: { subscription }
```

**Update Subscription**

```coffeescript
PUT    /api/v1/expenses/subscriptions/:id
Body: { amount, renewalDate, ... }
Response: { subscription }
```

**Delete Subscription**

```coffeescript
DELETE /api/v1/expenses/subscriptions/:id
Response: { success: true }
```

**Renew Subscription**

```coffeescript
POST   /api/v1/expenses/subscriptions/:id/renew
Response: { expense }
```

**Subscription Analytics**

```jsx
GET    /api/v1/expenses/subscriptions/analytics
Response: {
  totalMonthly: number,
  byCategory: {},
  trends: []
}
```

### **Habits**

**List Habits**

```coffeescript
GET    /api/v1/habits
Response: { habits: [] }
```

**Create Habit**

```coffeescript
POST   /api/v1/habits
Body: {
  name: string,
  category: "cigarettes"|"coffee"|"snacks"|...,
  unitCost: number,
  icon: string,
  targetReduction: number (percentage)
}
Response: { habit }
```

**Get Habit**

```coffeescript
GET    /api/v1/habits/:id
Response: { habit }
```

**Update Habit**

```coffeescript
PUT    /api/v1/habits/:id
Body: { unitCost, targetReduction, ... }
Response: { habit }
```

**Delete Habit**

```coffeescript
DELETE /api/v1/habits/:id
Response: { success: true }
```

**Log Habit**

```coffeescript
POST   /api/v1/habits/:id/log
Body: { quantity: number, date: string, time: string, notes: string }
Response: { log }
Calls: Automation Service (check habit spike triggers)
```

**Get Habit Logs**

```coffeescript
GET    /api/v1/habits/:id/logs
Query: { startDate: string, endDate: string }
Response: { logs: [] }
```

**Habit Analytics**

```coffeescript
GET    /api/v1/habits/:id/analytics
Query: { period: "week"|"month"|"year" }
Response: {
  totalCost: number,
  totalQuantity: number,
  trend: number,
  savingsPotential: number,
  projection: {}
}
```

**Habit Summary**

```coffeescript
GET    /api/v1/habits/summary
Response: {
  totalMonthly: number,
  byHabit: [],
  trends: []
}
```

### **Analytics**

**Expense Summary**

```coffeescript
GET    /api/v1/expenses/analytics/summary
Query: { startDate: string, endDate: string }
Response: {
  total: number,
  byCategory: [],
  byTag: [],
  dailyAverage: number,
  monthlyAverage: number,
  topExpenses: []
}
```

**Expense Trends**

```coffeescript
GET    /api/v1/expenses/analytics/trends
Query: { period: "week"|"month"|"year" }
Response: { trends: [], predictions: [] }
```

**Expense Comparison**

```coffeescript
GET    /api/v1/expenses/analytics/comparison
Query: { period1: string, period2: string }
Response: { comparison: {} }
```

**Category Breakdown**

```coffeescript
GET    /api/v1/expenses/analytics/by-category
Query: { startDate: string, endDate: string }
Response: { categories: [] }
```

**Payment Method Breakdown**

```coffeescript
GET    /api/v1/expenses/analytics/by-payment-method
Query: { startDate: string, endDate: string }
Response: { methods: [] }
```

### **Attachments**

**Add Attachments**

```coffeescript
POST   /api/v1/expenses/:id/attachments
Body: FormData { files: File[] }
Response: { urls: [] }
Calls: Report Service (file upload to S3)
```

**Delete Attachment**

```coffeescript
DELETE /api/v1/expenses/:id/attachments/:attachmentId
Response: { success: true }
```

### **4. Income Service - Port 3004**

**List Income Sources**

text

```
GET    /api/v1/income/sources
Response: { sources: [] }
```

**Create Income Source**

text

```
POST   /api/v1/income/sources
Body: {
  name: string (required),
  type: "salary"|"freelance"|"business"|"bonus"|"investment",
  amount: number,
  currency: string,
  frequency: "one-time"|"monthly"|"weekly"|"yearly",
  isRecurring: boolean,
  isActive: boolean
}
Response: { source }
```

**Get Income Source**

text

```
GET    /api/v1/income/sources/:id
Response: { source }
```

**Update Income Source**

text

```
PUT    /api/v1/income/sources/:id
Body: { name, amount, ... }
Response: { source }
```

**Delete Income Source**

text

```
DELETE /api/v1/income/sources/:id
Response: { success: true }
```

**Toggle Active Status**

text

```
PATCH  /api/v1/income/sources/:id/toggle
Response: { source }
```

### **Income Transactions**

**List Transactions**

text

```
GET    /api/v1/income/transactions
Query: {
  startDate: string,
  endDate: string,
  sourceId: string,
  limit: number,
  offset: number
}
Response: { transactions: [], total: number }
```

**Create Transaction**

text

```
POST   /api/v1/income/transactions
Body: {
  sourceId: string,
  amount: number,
  currency: string,
  date: string,
  description: string,
  category: string,
  paymentMethod: string,
  taxDeducted: number,
  netAmount: number
}
Response: { transaction }
Publishes: income.received event
Calls: Automation Service (check income-based triggers)
```

**Get Transaction**

text

```
GET    /api/v1/income/transactions/:id
Response: { transaction }
```

**Update Transaction**

text

```
PUT    /api/v1/income/transactions/:id
Body: { amount, taxDeducted, ... }
Response: { transaction }
```

**Delete Transaction**

text

```
DELETE /api/v1/income/transactions/:id
Response: { success: true }
```

### **Salary Management**

**Get Salary Info**

text

```
GET    /api/v1/income/salary
Response: {
  amount: number,
  salaryDay: number,
  deductions: [],
  bonuses: [],
  lastReceived: string
}
```

**Update Salary Info**

text

```
PUT    /api/v1/income/salary
Body: {
  amount: number,
  salaryDay: number,
  deductions: [],
  bonuses: []
}
Response: { salaryInfo }
```

**Get Next Salary Date**

text

```
GET    /api/v1/income/salary/next-date
Response: { nextSalaryDate: string, daysUntil: number }
```

**Record Salary Receipt**

text

```
POST   /api/v1/income/salary/receive
Body: { date: string, amount: number, deductions: [] }
Response: { transaction }
```

### **Cashflow Projection**

**Get Cashflow Projection**

text

```
GET    /api/v1/income/cashflow/projection
Query: { days: number (default: 30) }
Response: {
  projections: [],
  runOutDate: string,
  warnings: [],
  confidence: number
}
Calls: Expense Service (get burn rate)
Calls: Loan Service (get upcoming EMIs)
```

**Get Current Balance**

text

```
GET    /api/v1/income/cashflow/current-balance
Response: { balance: number, asOf: string }
Calls: Expense Service (total expenses)
```

**Get Long-term Forecast**

text

```
GET    /api/v1/income/cashflow/forecast
Query: { months: number (default: 6) }
Response: { forecast: [], confidence: number }
Calls: AI Service (predictive modeling)
```

**Refresh Projection**

text

```
POST   /api/v1/income/cashflow/refresh
Response: { success: true, calculatedAt: string }
```

### **Analytics**

**Income Summary**

text

```
GET    /api/v1/income/analytics/summary
Query: { startDate: string, endDate: string }
Response: {
  totalIncome: number,
  bySource: [],
  byType: [],
  growth: number,
  averageMonthly: number
}
```

**Income vs Expenses**

text

```
GET    /api/v1/income/analytics/vs-expenses
Query: { period: "month"|"year" }
Response: {
  income: number,
  expenses: number,
  surplus: number,
  savingsRate: number,
  trends: []
}
```

**Income Trends**

text

```
GET    /api/v1/income/analytics/trends
Response: { trends: [], yearOverYear: {} }
```

**Tax Summary**

text

```
GET    /api/v1/income/analytics/tax-summary
Response: {
  grossIncome: number,
  taxDeducted: number,
  netIncome: number,
  effectiveTaxRate: number
}
Calls: Tax Service (get tax calculations)
```

### **5. Investment Service - Port 3005**

### **Portfolio Management**

**List Portfolios**txt

```
GET    /api/v1/portfolios
Response: { portfolios: [] }
```

**Create Portfolio**

```
POST   /api/v1/portfolios
Body: { name: string, description: string }
Response: { portfolio }
```

**Get Portfolio**

```
GET    /api/v1/portfolios/:id
Response: { portfolio, assets: [], performance: {} }
```

**Update Portfolio**

text

```
PUT    /api/v1/portfolios/:id
Body: { name: string, description: string }
Response: { portfolio }
```

**Delete Portfolio**

text

```
DELETE /api/v1/portfolios/:id
Response: { success: true }
```

**Portfolio Summary**

text

```
GET    /api/v1/portfolios/:id/summary
Response: {
  totalInvested: number,
  currentValue: number,
  returns: number,
  returnPercentage: number,
  bestPerformer: {},
  worstPerformer: {}
}
```

### **Assets**

**List Assets in Portfolio**

text

```
GET    /api/v1/portfolios/:portfolioId/assets
Response: { assets: [] }
```

**Add Asset**

text

```
POST   /api/v1/portfolios/:portfolioId/assets
Body: {
  assetType: "stock"|"crypto"|"mutual_fund"|"etf"|"bond"|"custom",
  symbol: string,
  name: string,
  sector: string,
  notes: string
}
Response: { asset }
Calls: Market Data Service (get current price)
```

**Get Asset**

text

```
GET    /api/v1/portfolios/:portfolioId/assets/:assetId
Response: { asset, transactions: [], performance: {} }
```

**Update Asset**

text

```
PUT    /api/v1/portfolios/:portfolioId/assets/:assetId
Body: { name: string, sector: string, notes: string }
Response: { asset }
```

**Delete Asset**

text

```
DELETE /api/v1/portfolios/:portfolioId/assets/:assetId
Response: { success: true }
```

**Get Asset History**

text

```
GET    /api/v1/portfolios/:portfolioId/assets/:assetId/history
Query: { period: "1D"|"1W"|"1M"|"1Y" }
Response: { priceHistory: [] }
Calls: Market Data Service
```

### **Transactions**

**List Transactions**

text

```
GET    /api/v1/portfolios/:portfolioId/transactions
Query: {
  assetId: string,
  startDate: string,
  endDate: string,
  type: "buy"|"sell"|"dividend"
}
Response: { transactions: [] }
```

**Create Transaction**

text

```
POST   /api/v1/portfolios/:portfolioId/transactions
Body: {
  assetId: string,
  type: "buy"|"sell"|"dividend",
  quantity: number,
  price: number,
  fees: number,
  tax: number,
  date: string,
  time: string,
  notes: string
}
Response: { transaction }
Publishes: investment.transaction event
Calls: Tax Service (calculate capital gains)
```

**Get Transaction**

text

```
GET    /api/v1/portfolios/:portfolioId/transactions/:id
Response: { transaction }
```

**Update Transaction**

text

```
PUT    /api/v1/portfolios/:portfolioId/transactions/:id
Body: { quantity, price, fees, ... }
Response: { transaction }
```

**Delete Transaction**

text

```
DELETE /api/v1/portfolios/:portfolioId/transactions/:id
Response: { success: true }
```

### **Analytics & Performance**

**Portfolio Analytics**

text

```
GET    /api/v1/portfolios/:portfolioId/analytics
Response: {
  performance: {},
  diversification: {},
  riskMetrics: {},
  allocation: {}
}
```

**Returns Analysis**

text

```
GET    /api/v1/portfolios/:portfolioId/analytics/returns
Query: { period: "1M"|"3M"|"1Y"|"ALL" }
Response: {
  realizedReturns: number,
  unrealizedReturns: number,
  totalReturn: number,
  annualizedReturn: number
}
```

**Diversification Analysis**

text

```
GET    /api/v1/portfolios/:portfolioId/analytics/diversification
Response: {
  byAssetType: {},
  bySector: {},
  concentration: number,
  recommendations: []
}
```

**Risk Analysis**

text

```
GET    /api/v1/portfolios/:portfolioId/analytics/risk
Response: {
  volatility: number,
  sharpeRatio: number,
  maxDrawdown: number,
  beta: number,
  riskLevel: "low"|"medium"|"high"
}
```

**Top Performers**

text

```
GET    /api/v1/portfolios/:portfolioId/analytics/top-performers
Query: { limit: number (default: 10) }
Response: { winners: [], losers: [] }
```

**Rebalancing Recommendations**

text

```
GET    /api/v1/portfolios/:portfolioId/analytics/rebalancing
Response: { recommendations: [], targetAllocation: {} }
Calls: AI Service (rebalancing suggestions)
```

### **Price Updates**

**Refresh Prices**

text

```
POST   /api/v1/portfolios/:portfolioId/refresh-prices
Response: { updated: count }
Calls: Market Data Service (bulk price fetch)
```

**Price Update Status**

text

```
GET    /api/v1/portfolios/:portfolioId/prices/status
Response: { lastUpdate: string, nextUpdate: string, failures: [] }
```

### **Investment Goals**

**List Goals**

text

```
GET    /api/v1/portfolios/:portfolioId/goals
Response: { goals: [] }
```

**Create Goal**

text

```
POST   /api/v1/portfolios/:portfolioId/goals
Body: {
  name: string,
  targetAmount: number,
  targetDate: string,
  priority: "low"|"medium"|"high"
}
Response: { goal }
```

**Update Goal**

text

```
PUT    /api/v1/portfolios/:portfolioId/goals/:goalId
Body: { targetAmount, targetDate, ... }
Response: { goal }
```

**Delete Goal**

text

```
DELETE /api/v1/portfolios/:portfolioId/goals/:goalId
Response: { success: true }
```

**Goal Progress**

text

```
GET    /api/v1/portfolios/:portfolioId/goals/:goalId/progress
Response: {
  currentValue: number,
  targetAmount: number,
  percentage: number,
  onTrack: boolean,
  estimatedCompletion: string
}
Calls: AI Service (goal prediction)
```

### **Alerts & Signals**

**List Alerts**

text

```
GET    /api/v1/portfolios/:portfolioId/alerts
Response: { alerts: [] }
```

**Create Alert**

text

```
POST   /api/v1/portfolios/:portfolioId/alerts
Body: {
  assetId: string,
  type: "price"|"loss"|"gain",
  threshold: number,
  condition: "above"|"below",
  notificationChannels: []
}
Response: { alert }
```

**Delete Alert**

text

```
DELETE /api/v1/portfolios/:portfolioId/alerts/:alertId
Response: { success: true }
```

**Get Market Signals**

text

```
GET    /api/v1/portfolios/:portfolioId/signals
Response: { signals: [] }
Calls: AI Service (market signals)
```

### **Watchlist**

**Get Watchlist**

text

```
GET    /api/v1/investments/watchlist
Response: { watchlist: [] }
```

**Add to Watchlist**

text

```
POST   /api/v1/investments/watchlist
Body: {
  assetType: string,
  symbol: string,
  name: string,
  notes: string
}
Response: { watchlistItem }
Calls: Market Data Service (get price)
```

**Remove from Watchlist**

text

```
DELETE /api/v1/investments/watchlist/:itemId
Response: { success: true }
```

**Watchlist Analysis**

text

```
GET    /api/v1/investments/watchlist/:itemId/analysis
Response: { price: number, trends: [], signals: [], news: [] }
Calls: AI Service, Market Data Service
```

### **6. Loan & Debt Service - Port 3006**

### **Contacts**

**List Contacts**

text

```
GET    /api/v1/contacts
Query: {
  type: "app_user"|"external",
  search: string,
  groupId: string
}
Response: { contacts: [] }
Calls: User Service (for app_user contacts)
```

**Create Contact**

text

```
POST   /api/v1/contacts
Body: {
  contactType: "app_user"|"external",
  linkedUserId: string (if app_user),
  name: string,
  phone: string,
  email: string,
  relationship: string,
  nickname: string
}
Response: { contact }
Calls: User Service (verify linkedUserId if app_user)
```

**Get Contact**

text

```
GET    /api/v1/contacts/:id
Response: { contact }
```

**Update Contact**

text

```
PUT    /api/v1/contacts/:id
Body: { name, phone, email, nickname, ... }
Response: { contact }
```

**Delete Contact**

text

```
DELETE /api/v1/contacts/:id
Response: { success: true }
```

**Sync Contacts**

text

```
POST   /api/v1/contacts/sync
Body: { contacts: [] }
Response: { imported: count, matched: count }
Calls: User Service (find matching users)
```

**Get Contact's Loans**

text

```
GET    /api/v1/contacts/:id/loans
Response: { loans: [] }
```

### **Contact Groups**

**List Groups**

text

```
GET    /api/v1/contacts/groups
Response: { groups: [] }
```

**Create Group**

text

```
POST   /api/v1/contacts/groups
Body: { name: string, description: string, color: string }
Response: { group }
```

**Update Group**

text

```
PUT    /api/v1/contacts/groups/:id
Body: { name, description, color }
Response: { group }
```

**Delete Group**

text

```
DELETE /api/v1/contacts/groups/:id
Response: { success: true }
```

**Add Members to Group**

text

```
POST   /api/v1/contacts/groups/:id/members
Body: { contactIds: [] }
Response: { added: count }
```

**Remove Member from Group**

text

```
DELETE /api/v1/contacts/groups/:id/members/:contactId
Response: { success: true }
```

### **Loans**

**List Loans**

text

```
GET    /api/v1/loans
Query: {
  type: "borrowed"|"lent",
  status: "active"|"paid"|"overdue",
  contactId: string
}
Response: { loans: [], summary: {} }
```

**Create Loan**

text

```
POST   /api/v1/loans
Body: {
  contactId: string (required),
  type: "borrowed"|"lent",
  principalAmount: number (required),
  interestRate: number,
  interestType: "simple"|"compound"|"none",
  startDate: string (required),
  emiEnabled: boolean,
  emiFrequency: "monthly"|"weekly",
  emiAmount: number,
  reason: string,
  category: string
}
Response: { loan, emiSchedules: [] }
Calls: Automation Service (create EMI reminders)
Calls: Notification Service (notify contact)
```

**Get Loan**

text

```
GET    /api/v1/loans/:id
Response: { loan, contact, emiSchedules: [], payments: [], activities: [] }
```

**Update Loan**

text

```
PUT    /api/v1/loans/:id
Body: { interestRate, endDate, reason, ... }
Response: { loan }
```

**Delete Loan**

text

```
DELETE /api/v1/loans/:id
Response: { success: true }
```

**Update Loan Status**

text

```
PATCH  /api/v1/loans/:id/status
Body: { status: "active"|"paid"|"cancelled"|"defaulted" }
Response: { loan }
```

**Calculate Interest**

text

```
POST   /api/v1/loans/:id/calculate-interest
Body: { asOfDate: string }
Response: { interest: number, totalAmount: number }
```

### **EMI Schedules**

**List EMI Schedules**

text

```
GET    /api/v1/loans/:loanId/emi-schedules
Response: { schedules: [] }
```

**Get EMI Schedule**

text

```
GET    /api/v1/loans/:loanId/emi-schedules/:scheduleId
Response: { schedule }
```

**Update EMI Schedule**

text

```
PUT    /api/v1/loans/:loanId/emi-schedules/:scheduleId
Body: { dueDate: string, amount: number, status: string }
Response: { schedule }
```

**Skip EMI**

text

```
POST   /api/v1/loans/:loanId/emi-schedules/:scheduleId/skip
Body: { reason: string }
Response: { schedule }
```

**Waive EMI**

text

```
POST   /api/v1/loans/:loanId/emi-schedules/:scheduleId/waive
Body: { reason: string }
Response: { schedule }
```

**Regenerate EMI Schedule**

text

```
POST   /api/v1/loans/:loanId/emi-schedules/regenerate
Body: { startDate: string, frequency: string, amount: number }
Response: { schedules: [] }
```

**Get Upcoming EMIs**

text

```
GET    /api/v1/loans/:loanId/emi-schedules/upcoming
Query: { days: number (default: 7) }
Response: { upcoming: [] }
Calls: Notification Service (check reminders)
```

### **Payments**

**List Payments**

text

```
GET    /api/v1/loans/:loanId/payments
Response: { payments: [] }
```

**Record Payment**

text

```
POST   /api/v1/loans/:loanId/payments
Body: {
  amount: number,
  paymentDate: string,
  emiScheduleId: string,
  principalPaid: number,
  interestPaid: number,
  lateFee: number,
  paymentMethod: string,
  paymentReference: string,
  notes: string
}
Response: { payment, updatedLoan }
Publishes: loan.payment event
Calls: Automation Service (check payment-based triggers)
```

**Get Payment**

text

```
GET    /api/v1/loans/:loanId/payments/:paymentId
Response: { payment }
```

**Update Payment**

text

```
PUT    /api/v1/loans/:loanId/payments/:paymentId
Body: { amount: number, notes: string, ... }
Response: { payment }
```

**Delete Payment**

text

```
DELETE /api/v1/loans/:loanId/payments/:paymentId
Response: { success: true }
```

**Verify Payment**

text

```
POST   /api/v1/loans/:loanId/payments/:paymentId/verify
Body: { verified: boolean }
Response: { payment }
```

**Upload Payment Receipt**

text

```
POST   /api/v1/loans/:loanId/payments/:paymentId/receipt
Body: FormData { receipt: File }
Response: { receiptUrl: string }
```

### **Early Repayment**

**Calculate Early Repayment**

text

```
POST   /api/v1/loans/:loanId/early-repayment/calculate
Body: { repaymentDate: string, amount: number }
Response: {
  interest: number,
  totalAmount: number,
  savings: number,
  breakdown: {}
}
```

**Process Early Repayment**

text

```
POST   /api/v1/loans/:loanId/early-repayment
Body: { amount: number, date: string, paymentMethod: string }
Response: { payment, updatedLoan }
```

### **Reminders**

**List Reminders**

text

```
GET    /api/v1/loans/reminders
Query: { upcoming: boolean }
Response: { reminders: [] }
```

**Create Reminder**

text

```
POST   /api/v1/loans/:loanId/reminders
Body: {
  reminderType: string,
  reminderDate: string,
  notificationChannels: []
}
Response: { reminder }
```

**Acknowledge Reminder**

text

```
PATCH  /api/v1/loans/reminders/:reminderId/acknowledge
Response: { reminder }
```

**Snooze Reminder**

text

```
PATCH  /api/v1/loans/reminders/:reminderId/snooze
Body: { snoozeUntil: string }
Response: { reminder }
```

### **Analytics**

**Loan Summary**

text

```
GET    /api/v1/loans/analytics/summary
Response: {
  totalBorrowed: number,
  totalLent: number,
  totalRepaid: number,
  outstanding: number,
  interestPaid: number
}
```

**Loans by Contact**

text

```
GET    /api/v1/loans/analytics/by-contact
Response: { contacts: [] }
```

**Overdue Loans**

text

```
GET    /api/v1/loans/analytics/overdue
Response: { overdueLoans: [], totalOverdue: number }
```

**Interest Paid Analysis**

text

```
GET    /api/v1/loans/analytics/interest-paid
Query: { year: number }
Response: { totalInterest: number, byLoan: [] }
```

**Payment History**

text

```
GET    /api/v1/loans/analytics/payment-history
Query: { startDate: string, endDate: string }
Response: { payments: [], trends: [] }
```

### **Loan Templates**

**List Templates**

text

```
GET    /api/v1/loans/templates
Response: { templates: [] }
```

**Create Template**

text

```
POST   /api/v1/loans/templates
Body: {
  templateName: string,
  type: "borrowed"|"lent",
  defaultAmount: number,
  interestRate: number,
  interestType: string,
  emiFrequency: string,
  category: string
}
Response: { template }
```

**Update Template**

text

```
PUT    /api/v1/loans/templates/:id
Body: { templateName, defaultAmount, ... }
Response: { template }
```

**Delete Template**

text

```
DELETE /api/v1/loans/templates/:id
Response: { success: true }
```

**Apply Template**

text

```
POST   /api/v1/loans/templates/:id/apply
Body: { contactId: string, amount: number, startDate: string }
Response: { loan }
```

### **Disputes**

**List Disputes**

text

```
GET    /api/v1/loans/:loanId/disputes
Response: { disputes: [] }
```

**Create Dispute**

text

```
POST   /api/v1/loans/:loanId/disputes
Body: {
  disputeType: string,
  description: string,
  expectedResolution: string,
  attachments: []
}
Response: { dispute }
Calls: Notification Service (notify other party)
```

**Update Dispute**

text

```
PUT    /api/v1/loans/:loanId/disputes/:disputeId
Body: { description: string, status: string, resolution: string }
Response: { dispute }
```

**Delete Dispute**

text

```
DELETE /api/v1/loans/:loanId/disputes/:disputeId
Response: { success: true }
```

### **Activities Log**

**Get Activities**

text

```
GET    /api/v1/loans/:loanId/activities
Response: { activities: [] }
```

### **7. Group Finance Service - Port 3007**

### **Groups**

**List Groups**

text

```
GET    /api/v1/groups
Response: { groups: [] }
```

**Create Group**

text

```
POST   /api/v1/groups
Body: {
  name: string (required),
  description: string,
  groupType: "trip"|"party"|"office"|"event"|"general",
  settings: {}
}
Response: { group }
```

**Get Group**

text

```
GET    /api/v1/groups/:id
Response: { group, members: [], balances: {}, recentExpenses: [] }
```

**Update Group**

text

```
PUT    /api/v1/groups/:id
Body: { name: string, description: string, settings: {} }
Response: { group }
```

**Delete Group**

text

```
DELETE /api/v1/groups/:id
Response: { success: true }
```

**Archive Group**

text

```
POST   /api/v1/groups/:id/archive
Response: { group }
```

**Activate Group**

text

```
POST   /api/v1/groups/:id/activate
Response: { group }
```

### **Members**

**List Members**

text

```
GET    /api/v1/groups/:groupId/members
Response: { members: [] }
```

**Invite Member**

text

```
POST   /api/v1/groups/:groupId/members/invite
Body: {
  userId: string,
  email: string,
  displayName: string,
  role: "admin"|"member"|"viewer"
}
Response: { invitation }
Calls: User Service (get user details)
Calls: Notification Service (send invitation)
```

**Accept Invitation**

text

```
POST   /api/v1/groups/:groupId/members/accept-invite
Body: { invitationToken: string }
Response: { member }
```

**Update Member**

text

```
PUT    /api/v1/groups/:groupId/members/:memberId
Body: { role: string, displayName: string }
Response: { member }
```

**Remove Member**

text

```
DELETE /api/v1/groups/:groupId/members/:memberId
Response: { success: true }
```

**Leave Group**

text

```
POST   /api/v1/groups/:groupId/members/:memberId/leave
Response: { success: true }
```

### **Group Expenses**

**List Expenses**

text

```
GET    /api/v1/groups/:groupId/expenses
Query: {
  startDate: string,
  endDate: string,
  paidBy: string,
  limit: number,
  offset: number
}
Response: { expenses: [], total: number }
```

**Create Expense**

text

```
POST   /api/v1/groups/:groupId/expenses
Body: {
  amount: number (required),
  description: string (required),
  category: string,
  date: string,
  paidBy: string (userId),
  splitType: "equal"|"unequal"|"percentage"|"weight"|"custom",
  splits: [
    { userId: string, shareAmount: number, sharePercentage: number, weight: number }
  ],
  attachments: []
}
Response: { expense, splits: [] }
Publishes: group.expense.created event
Calls: Notification Service (notify members)
```

**Get Expense**

text

```
GET    /api/v1/groups/:groupId/expenses/:expenseId
Response: { expense, splits: [], paidBy: {} }
```

**Update Expense**

text

```
PUT    /api/v1/groups/:groupId/expenses/:expenseId
Body: { amount, description, splits, ... }
Response: { expense }
```

**Delete Expense**

text

```
DELETE /api/v1/groups/:groupId/expenses/:expenseId
Response: { success: true }
```

**Mark Split as Paid**

text

```
POST   /api/v1/groups/:groupId/expenses/:expenseId/splits/:splitId/mark-paid
Response: { split }
```

### **Balances & Settlement**

**Get Balances**

text

```
GET    /api/v1/groups/:groupId/balances
Response: { balances: [], simplified: [] }
```

**Calculate Balances**

text

```
POST   /api/v1/groups/:groupId/balances/calculate
Response: { balances: [], settlements: [] }
```

**Create Settlement**

text

```
POST   /api/v1/groups/:groupId/settle
Body: {
  fromUserId: string,
  toUserId: string,
  amount: number,
  notes: string
}
Response: { settlement }
Publishes: group.settlement event
Calls: Notification Service (notify users)
```

**List Settlements**

text

```
GET    /api/v1/groups/:groupId/settlements
Response: { settlements: [] }
```

**Update Settlement**

text

```
PUT    /api/v1/groups/:groupId/settlements/:settlementId
Body: { status: "completed"|"cancelled", settlementDate: string }
Response: { settlement }
```

**Get Pending Settlements**

text

```
GET    /api/v1/groups/:groupId/settlements/pending
Response: { pending: [] }
```

### **Group Chat (Optional)**

**Get Messages**

text

```
GET    /api/v1/groups/:groupId/messages
Query: { limit: number, before: string, after: string }
Response: { messages: [] }
```

**Send Message**

text

```
POST   /api/v1/groups/:groupId/messages
Body: {
  content: string,
  messageType: "text"|"image"|"expense",
  attachments: [],
  metadata: {}
}
Response: { message }
WebSocket: Broadcast to group members
```

**Delete Message**

text

```
DELETE /api/v1/groups/:groupId/messages/:messageId
Response: { success: true }
```

**React to Message**

text

```
POST   /api/v1/groups/:groupId/messages/:messageId/react
Body: { emoji: string }
Response: { message }
```

### **Analytics**

**Group Summary**

text

```
GET    /api/v1/groups/:groupId/analytics/summary
Response: {
  totalExpenses: number,
  byMember: [],
  byCategory: [],
  avgPerMember: number
}
```

**Member Spending**

text

```
GET    /api/v1/groups/:groupId/analytics/member-spending
Query: { memberId: string }
Response: {
  totalSpent: number,
  totalPaid: number,
  balance: number,
  expenses: []
}
```

**Group Trends**

text

```
GET    /api/v1/groups/:groupId/analytics/trends
Response: { trends: [], avgPerMember: number }
```

**Export Group Data**

text

```
GET    /api/v1/groups/:groupId/analytics/export
Query: { format: "pdf"|"csv"|"xlsx" }
Response: { fileUrl: string }
Calls: Report Service
```

### **8. Tax Service - Port 3008**

### **Tax Profiles**

**Get Tax Profile**

text

```
GET    /api/v1/tax/profile
Response: {
  countryCode: string,
  region: string,
  taxYear: number,
  filingStatus: string,
  dependents: number,
  customRules: {}
}
```

**Update Tax Profile**

text

```
PUT    /api/v1/tax/profile
Body: {
  countryCode: string,
  region: string,
  taxYear: number,
  filingStatus: string,
  dependents: number,
  customRules: {}
}
Response: { profile }
```

**Delete Tax Profile**

text

```
DELETE /api/v1/tax/profile
Response: { success: true }
```

### **Tax Brackets (Admin/System)**

**Get Tax Brackets**

text

```
GET    /api/v1/tax/brackets
Query: { countryCode: string, taxYear: number, bracketType: string }
Response: { brackets: [] }
[Admin only]
```

**Create Tax Bracket**

text

```
POST   /api/v1/tax/brackets
Body: {
  countryCode: string,
  taxYear: number,
  minIncome: number,
  maxIncome: number,
  taxRate: number,
  bracketType: string
}
Response: { bracket }
[Admin only]
```

### **Deductions**

**List Deductions**

text

```
GET    /api/v1/tax/deductions
Query: { taxYear: number }
Response: { deductions: [] }
```

**Create Deduction**

text

```
POST   /api/v1/tax/deductions
Body: {
  taxYear: number,
  category: string,
  amount: number,
  description: string,
  date: string,
  documentUrl: string
}
Response: { deduction }
```

**Update Deduction**

text

```
PUT    /api/v1/tax/deductions/:id
Body: { amount: number, description: string, ... }
Response: { deduction }
```

**Delete Deduction**

text

```
DELETE /api/v1/tax/deductions/:id
Response: { success: true }
```

**Upload Deduction Document**

text

```
POST   /api/v1/tax/deductions/:id/document
Body: FormData { document: File }
Response: { documentUrl: string }
Calls: Report Service (file upload)
```

### **Tax Calculation**

**Calculate Tax**

text

```
GET    /api/v1/tax/calculate
Query: { taxYear: number }
Response: {
  totalIncome: number,
  taxableIncome: number,
  totalDeductions: number,
  taxOwed: number,
  capitalGainsTax: number,
  breakdown: {}
}
Calls: Income Service (get income)
Calls: Investment Service (get capital gains)
Calls: Expense Service (get deductible expenses)
```

**Refresh Tax Calculation**

text

```
POST   /api/v1/tax/calculate/refresh
Body: { taxYear: number }
Response: { calculation }
```

**Tax Estimation**

text

```
GET    /api/v1/tax/estimate
Query: { projectedIncome: number, deductions: number }
Response: {
  estimatedTax: number,
  effectiveRate: number,
  marginalRate: number
}
```

### **Tax Savings Suggestions**

**Get Suggestions**

text

```
GET    /api/v1/tax/suggestions
Query: { taxYear: number }
Response: { suggestions: [] }
Calls: AI Service (tax optimization suggestions)
```

**Get Deductible Expenses**

text

```
GET    /api/v1/tax/deductible-expenses
Query: { year: number }
Response: { expenses: [], total: number }
Calls: Expense Service
```

### **Tax Reports**

**Tax Summary**

text

```
GET    /api/v1/tax/reports/summary
Query: { taxYear: number }
Response: {
  incomeSummary: {},
  deductionsSummary: {},
  investmentSummary: {},
  taxSummary: {}
}
```

**Income Statement**

text

```
GET    /api/v1/tax/reports/income-statement
Query: { taxYear: number, format: "pdf"|"xlsx"|"json" }
Response: { fileUrl or data }
Calls: Report Service
```

**Investment Statement**

text

```
GET    /api/v1/tax/reports/investment-statement
Query: { taxYear: number, format: string }
Response: { fileUrl or data }
Calls: Report Service
```

**Deductions Statement**

text

```
GET    /api/v1/tax/reports/deductions-statement
Query: { taxYear: number, format: string }
Response: { fileUrl or data }
Calls: Report Service
```

**Generate Full Tax Report**

text

```
POST   /api/v1/tax/reports/generate-full
Body: {
  taxYear: number,
  format: string,
  includeAttachments: boolean
}
Response: { jobId: string }
Calls: Report Service (async job)
```

**Check Report Job Status**

text

```
GET    /api/v1/tax/reports/jobs/:jobId
Response: { status: string, fileUrl: string, error: string }
```

### **Capital Gains**

**Get Capital Gains**

text

```
GET    /api/v1/tax/capital-gains
Query: { taxYear: number }
Response: {
  shortTerm: [],
  longTerm: [],
  totalGains: number,
  totalLosses: number,
  netGains: number
}
Calls: Investment Service
```

**Calculate Capital Gains**

text

```
POST   /api/v1/tax/capital-gains/calculate
Body: {
  assetId: string,
  buyDate: string,
  sellDate: string,
  buyPrice: number,
  sellPrice: number,
  quantity: number
}
Response: {
  capitalGain: number,
  taxOwed: number,
  holdingPeriod: string
}
```

### **9. AI/Analytics Service - Port 3009**

### **AI Chat**

**Chat**

text

```
POST   /api/v1/ai/chat
Body: {
  message: string,
  sessionId: string,
  context: {}
}
Response: {
  reply: string,
  intent: string,
  entities: [],
  suggestions: []
}
Calls: Multiple services based on intent
```

**List Chat Sessions**

text

```
GET    /api/v1/ai/chat/sessions
Response: { sessions: [] }
```

**Get Chat Session**

text

```
GET    /api/v1/ai/chat/sessions/:sessionId
Response: { session, messages: [] }
```

**Delete Chat Session**

text

```
DELETE /api/v1/ai/chat/sessions/:sessionId
Response: { success: true }
```

### **Auto-Categorization**

**Categorize Expense**

text

```
POST   /api/v1/ai/categorize
Body: {
  description: string,
  amount: number,
  date: string,
  merchant: string
}
Response: {
  categoryId: string,
  confidence: number,
  alternatives: []
}
```

**Batch Categorize**

text

```
POST   /api/v1/ai/categorize/batch
Body: { expenses: [] }
Response: { categorized: [] }
```

**Train Categorization Model**

text

```
POST   /api/v1/ai/categorize/train
Body: { userId: string }
Response: { modelVersion: string, accuracy: number }
[Triggered periodically]
```

### **Voice Processing**

**Transcribe Audio**

text

```
POST   /api/v1/ai/voice/transcribe
Body: FormData { audio: File }
Response: { text: string, confidence: number }
```

**Parse Expense from Voice**

text

```
POST   /api/v1/ai/voice/parse-expense
Body: { text: string }
Response: {
  amount: number,
  category: string,
  description: string,
  confidence: number
}
```

### **Text Parsing**

**Parse Expense Text**

text

```
POST   /api/v1/ai/text/parse-expense
Body: { text: string }
Response: {
  amount: number,
  category: string,
  description: string,
  date: string,
  confidence: number
}
```

**Extract Entities**

text

```
POST   /api/v1/ai/text/extract-entities
Body: { text: string }
Response: { entities: [] }
```

### **Insights**

**Get Insights**

text

```
GET    /api/v1/ai/insights
Response: { insights: [] }
Calls: Expense Service, Income Service, Investment Service
```

**Get Insight**

text

```
GET    /api/v1/ai/insights/:id
Response: { insight }
```

**Mark Insight as Read**

text

```
PATCH  /api/v1/ai/insights/:id/read
Response: { insight }
```

**Delete Insight**

text

```
DELETE /api/v1/ai/insights/:id
Response: { success: true }
```

**Generate Insights**

text

```
POST   /api/v1/ai/insights/generate
Response: { insights: [] }
```

### **Spending Patterns**

**Analyze Spending Patterns**

text

```
GET    /api/v1/ai/patterns/spending
Query: { period: "week"|"month"|"year" }
Response: {
  patterns: [],
  anomalies: [],
  trends: []
}
Calls: Expense Service
```

**Analyze Habits**

text

```
GET    /api/v1/ai/patterns/habits
Response: { habits: [], recommendations: [] }
Calls: Expense Service (habit logs)
```

### **Predictions**

**Cashflow Prediction**

text

```
POST   /api/v1/ai/predict/cashflow
Body: { days: number }
Response: {
  predictions: [],
  confidence: number,
  warnings: []
}
Calls: Income Service, Expense Service, Loan Service
```

**Savings Goal Prediction**

text

```
POST   /api/v1/ai/predict/savings
Body: { goalAmount: number, targetDate: string }
Response: {
  achievable: boolean,
  monthlySavingsRequired: number,
  recommendations: []
}
```

**Expense Prediction**

text

```
POST   /api/v1/ai/predict/expense
Body: { category: string, month: string }
Response: {
  predictedAmount: number,
  confidence: number,
  range: {}
}
```

### **Financial Advice**

**Savings Advice**

text

```
POST   /api/v1/ai/advice/savings
Response: { suggestions: [] }
Calls: Expense Service, Income Service
```

**Debt Repayment Strategy**

text

```
POST   /api/v1/ai/advice/debt-repayment
Response: {
  strategy: {},
  projections: [],
  savings: {}
}
Calls: Loan Service
```

**Investment Advice**

text

```
POST   /api/v1/ai/advice/investment
Response: {
  suggestions: [],
  riskAnalysis: {}
}
Calls: Investment Service, User Service (risk preference)
```

**Budget Optimization**

text

```
POST   /api/v1/ai/advice/budget-optimization
Response: {
  optimizations: [],
  potentialSavings: {}
}
```

### **Anomaly Detection**

**Get Anomalies**

text

```
GET    /api/v1/ai/anomalies
Response: { anomalies: [] }
```

**Detect Anomalies**

text

```
POST   /api/v1/ai/anomalies/detect
Response: {
  anomalies: [],
  risk: "low"|"medium"|"high"
}
Calls: Expense Service
```

### **Investment Signals**

**Get Investment Signals**

text

```
GET    /api/v1/ai/investment/signals
Query: { portfolioId: string }
Response: { signals: [] }
Calls: Investment Service, Market Data Service
```

**Rebalancing Recommendations**

text

```
GET    /api/v1/ai/investment/rebalancing
Query: { portfolioId: string }
Response: {
  recommendations: [],
  targetAllocation: {}
}
```

**Analyze Asset**

text

```
POST   /api/v1/ai/investment/analyze-asset
Body: { assetType: string, symbol: string }
Response: {
  analysis: {},
  recommendation: "buy"|"hold"|"sell",
  confidence: number
}
Calls: Market Data Service
```

### **10. Notification Service - Port 3010**

### **Notifications**

**List Notifications**

text

```
GET    /api/v1/notifications
Query: {
  isRead: boolean,
  type: string,
  limit: number,
  offset: number
}
Response: { notifications: [], unreadCount: number }
```

**Get Notification**

text

```
GET    /api/v1/notifications/:id
Response: { notification }
```

**Mark as Read**

text

```
PATCH  /api/v1/notifications/:id/read
Response: { notification }
```

**Mark All as Read**

text

```
POST   /api/v1/notifications/mark-all-read
Response: { updated: number }
```

**Delete Notification**

text

```
DELETE /api/v1/notifications/:id
Response: { success: true }
```

**Bulk Delete**

text

```
DELETE /api/v1/notifications/bulk
Body: { notificationIds: [] }
Response: { deleted: number }
```

**Unread Count**

text

```
GET    /api/v1/notifications/unread-count
Response: { count: number }
```

### **Push Notifications**

**Register Device**

text

```
POST   /api/v1/notifications/push/register
Body: {
  deviceToken: string,
  platform: "ios"|"android"|"web"
}
Response: { success: true }
```

**Unregister Device**

text

```
DELETE /api/v1/notifications/push/unregister
Body: { deviceToken: string }
Response: { success: true }
```

**Test Push**

text

```
POST   /api/v1/notifications/push/test
Response: { success: true }
```

### **Email Notifications**

**Verify Email**

text

```
POST   /api/v1/notifications/email/verify
Body: { email: string }
Response: { sent: true }
```

**Test Email**

text

```
POST   /api/v1/notifications/email/test
Response: { sent: true }
```

### **SMS Notifications**

**Verify Phone**

text

```
POST   /api/v1/notifications/sms/verify
Body: { phone: string }
Response: { sent: true }
```

**Test SMS**

text

```
POST   /api/v1/notifications/sms/test
Response: { sent: true }
```

### **Templates (Admin/Internal)**

**List Templates**

text

```
GET    /api/v1/notifications/templates
Query: { category: string, channel: string }
Response: { templates: [] }
[Internal use]
```

**Create Template**

text

```
POST   /api/v1/notifications/templates
Body: {
  category: string,
  channel: string,
  templateKey: string,
  subject: string,
  bodyTemplate: string,
  variables: {}
}
Response: { template }
[Internal use]
```

### **Send Notification (Internal)**

**Send Notification**

text

```
POST   /api/v1/notifications/send
Body: {
  userId: string,
  type: string,
  category: string,
  title: string,
  body: string,
  data: {},
  channels: [],
  priority: "low"|"medium"|"high"
}
Response: { notification }
[Called by other services]
```

**Batch Send**

text

```
POST   /api/v1/notifications/send/batch
Body: { notifications: [] }
Response: { sent: number, failed: [] }
[Called by other services]
```

### **11. Automation Service - Port 3011**

### **Rules**

**List Rules**

text

```
GET    /api/v1/automation/rules
Response: { rules: [] }
```

**Create Rule**

text

```
POST   /api/v1/automation/rules
Body: {
  name: string,
  description: string,
  triggerType: "time"|"expense"|"income"|"investment"|"group",
  triggerConfig: {},
  actionType: "notify"|"save"|"log"|"categorize",
  actionConfig: {},
  conditions: {},
  isActive: boolean
}
Response: { rule }
```

**Get Rule**

text

```
GET    /api/v1/automation/rules/:id
Response: { rule, executions: [] }
```

**Update Rule**

text

```
PUT    /api/v1/automation/rules/:id
Body: { name, triggerConfig, actionConfig, conditions, ... }
Response: { rule }
```

**Delete Rule**

text

```
DELETE /api/v1/automation/rules/:id
Response: { success: true }
```

**Toggle Rule**

text

```
PATCH  /api/v1/automation/rules/:id/toggle
Response: { rule }
```

**Test Rule**

text

```
POST   /api/v1/automation/rules/:id/test
Response: { success: boolean, result: {}, error: string }
```

### **Rule Templates**

**List Templates**

text

```
GET    /api/v1/automation/templates
Response: { templates: [] }
```

**Apply Template**

text

```
POST   /api/v1/automation/templates/:templateId/apply
Body: { customizations: {} }
Response: { rule }
```

### **Executions**

**Get Rule Executions**

text

```
GET    /api/v1/automation/rules/:ruleId/executions
Query: { limit: number, offset: number }
Response: { executions: [] }
```

**Get Execution**

text

```
GET    /api/v1/automation/executions/:executionId
Response: { execution }
```

**List All Executions**

text

```
GET    /api/v1/automation/executions
Query: {
  status: string,
  startDate: string,
  endDate: string
}
Response: { executions: [] }
```

### **Scheduled Tasks**

**List Tasks**

text

```
GET    /api/v1/automation/tasks
Response: { tasks: [] }
```

**Create Task**

text

```
POST   /api/v1/automation/tasks
Body: {
  name: string,
  schedule: string (cron expression),
  action: {},
  enabled: boolean
}
Response: { task }
```

**Update Task**

text

```
PUT    /api/v1/automation/tasks/:id
Body: { schedule: string, action: {}, ... }
Response: { task }
```

**Delete Task**

text

```
DELETE /api/v1/automation/tasks/:id
Response: { success: true }
```

### **Triggers (Internal)**

**Trigger Event**

text

```
POST   /api/v1/automation/trigger
Body: { event: string, data: {} }
Response: { triggered: number }
[Called by other services when events occur]
```

### **12. Report/Export Service - Port 3012**

### **Report Generation**

**Generate Report**

text

```
POST   /api/v1/reports/generate
Body: {
  reportType: "monthly"|"tax"|"portfolio"|"custom",
  format: "pdf"|"xlsx"|"csv"|"json",
  parameters: {
    startDate: string,
    endDate: string,
    categories: []
  }
}
Response: { jobId: string, status: "pending" }
Calls: Multiple services to gather data
```

**Get Report**

text

```
GET    /api/v1/reports/:reportId
Response: { report, status: string, fileUrl: string, createdAt: string }
```

**List Reports**

text

```
GET    /api/v1/reports
Query: { reportType: string, status: string, limit: number }
Response: { reports: [] }
```

**Delete Report**

text

```
DELETE /api/v1/reports/:reportId
Response: { success: true }
```

**Download Report**

text

```
GET    /api/v1/reports/:reportId/download
Response: File download
```

**Regenerate Report**

text

```
POST   /api/v1/reports/:reportId/regenerate
Response: { jobId: string }
```

### **Monthly Reports**

**Generate Monthly Report**

text

```
POST   /api/v1/reports/monthly
Body: {
  year: number,
  month: number,
  format: string,
  includeCharts: boolean,
  categories: []
}
Response: { jobId: string }
Calls: Expense, Income, Investment, Loan services
```

**Get Latest Monthly Report**

text

```
GET    /api/v1/reports/monthly/latest
Response: { report }
```

### **Tax Reports**

**Generate Tax Report**

text

```
POST   /api/v1/reports/tax
Body: {
  taxYear: number,
  format: string,
  includeAttachments: boolean
}
Response: { jobId: string }
Calls: Tax Service, Income Service, Investment Service
```

**Get Tax Report**

text

```
GET    /api/v1/reports/tax/:year
Response: { report }
```

### **Portfolio Reports**

**Generate Portfolio Report**

text

```
POST   /api/v1/reports/portfolio
Body: {
  portfolioId: string,
  startDate: string,
  endDate: string,
  format: string
}
Response: { jobId: string }
Calls: Investment Service
```

**Generate Performance Report**

text

```
POST   /api/v1/reports/portfolio/:portfolioId/performance
Body: { period: string, format: string }
Response: { jobId: string }
```

### **Custom Reports**

**Generate Custom Report**

text

```
POST   /api/v1/reports/custom
Body: {
  title: string,
  datasources: [],
  filters: {},
  format: string,
  template: string
}
Response: { jobId: string }
```

**List Templates**

text

```
GET    /api/v1/reports/custom/templates
Response: { templates: [] }
```

**Create Template**

text

```
POST   /api/v1/reports/custom/templates
Body: {
  name: string,
  description: string,
  config: {}
}
Response: { template }
```

### **Data Export**

**Export All Data**

text

```
POST   /api/v1/reports/export/all-data
Body: {
  format: "json"|"csv",
  includeAttachments: boolean
}
Response: { jobId: string }
[GDPR compliance - full data export]
```

**Export Expenses**

text

```
POST   /api/v1/reports/export/expenses
Body: { startDate: string, endDate: string, format: string }
Response: { jobId: string }
```

**Export Income**

text

```
POST   /api/v1/reports/export/income
Body: { startDate: string, endDate: string, format: string }
Response: { jobId: string }
```

**Export Investments**

text

```
POST   /api/v1/reports/export/investments
Body: { portfolioId: string, format: string }
Response: { jobId: string }
```

**Export Loans**

text

```
POST   /api/v1/reports/export/loans
Body: { format: string }
Response: { jobId: string }
```

### **Charts & Visualizations**

**Spending Trends Chart**

text

```
GET    /api/v1/reports/charts/spending-trends
Query: { period: string, categoryId: string }
Response: { chartData: {} }
```

**Income vs Expense Chart**

text

```
GET    /api/v1/reports/charts/income-vs-expense
Query: { year: number }
Response: { chartData: {} }
```

**Portfolio Performance Chart**

text

```
GET    /api/v1/reports/charts/portfolio-performance
Query: { portfolioId: string, period: string }
Response: { chartData: {} }
```

**Net Worth Chart**

text

```
GET    /api/v1/reports/charts/net-worth
Query: { startDate: string, endDate: string }
Response: { chartData: {} }
Calls: Multiple services
```

### **File Upload (Internal)**

**Upload File**

text

```
POST   /api/v1/reports/upload
Body: FormData { file: File, metadata: {} }
Response: { fileUrl: string, fileSize: number }
[Used by other services for file storage]
```

**Delete File**

text

```
DELETE /api/v1/reports/upload/:fileId
Response: { success: true }
```

### **13. Market Data Service - Port 3013**

### **Stock Prices**

**Get Stock Quote**

text

```
GET    /api/v1/market/stocks/:symbol
Response: {
  symbol: string,
  price: number,
  change: number,
  changePercent: number,
  timestamp: string,
  volume: number,
  marketCap: number
}
```

**Get Stock History**

text

```
GET    /api/v1/market/stocks/:symbol/history
Query: { period: "1D"|"1W"|"1M"|"3M"|"1Y"|"5Y" }
Response: { prices: [] }
```

**Batch Stock Quotes**

text

```
POST   /api/v1/market/stocks/batch
Body: { symbols: [] }
Response: { quotes: [] }
```

**Search Stocks**

text

```
GET    /api/v1/market/stocks/search
Query: { q: string }
Response: { results: [] }
```

### **Cryptocurrency Prices**

**Get Crypto Quote**

text

```
GET    /api/v1/market/crypto/:symbol
Response: {
  symbol: string,
  price: number,
  change: number,
  changePercent: number,
  volume: number,
  marketCap: number
}
```

**Get Crypto History**

text

```
GET    /api/v1/market/crypto/:symbol/history
Query: { period: string, interval: string }
Response: { prices: [] }
```

**Batch Crypto Quotes**

text

```
POST   /api/v1/market/crypto/batch
Body: { symbols: [] }
Response: { quotes: [] }
```

**Trending Cryptos**

text

```
GET    /api/v1/market/crypto/trending
Response: { trending: [] }
```

### **Mutual Funds & ETFs**

**Get Fund Quote**

text

```
GET    /api/v1/market/funds/:symbol
Response: {
  symbol: string,
  nav: number,
  change: number,
  changePercent: number
}
```

**Get Fund History**

text

```
GET    /api/v1/market/funds/:symbol/history
Query: { period: string }
Response: { prices: [] }
```

### **Exchange Rates**

**Get Exchange Rate**

text

```
GET    /api/v1/market/forex/:pair
Query: { from: string, to: string }
Response: { rate: number, timestamp: string }
```

**Get All Rates**

text

```
GET    /api/v1/market/forex/rates
Query: { base: string }
Response: { rates: {} }
```

### **Market News**

**Get Market News**

text

```
GET    /api/v1/market/news
Query: { category: string, limit: number }
Response: { articles: [] }
```

**Get Stock News**

text

```
GET    /api/v1/market/news/:symbol
Response: { articles: [] }
```

### **Market Status**

**Get Market Status**

text

```
GET    /api/v1/market/status
Response: { markets: [], nextOpen: string, nextClose: string }
```

### **Price Updates (Internal)**

**Refresh Prices**

text

```
POST   /api/v1/market/refresh-prices
Body: { assetType: string, symbols: [] }
Response: { updated: number }
[Called by Investment Service]
```

**Subscribe to Updates**

text

```
POST   /api/v1/market/subscribe
Body: { symbols: [], callback: string }
Response: { subscriptionId: string }
[WebSocket for real-time prices]
```

### **Cache Management**

**Clear Cache**

text

```
POST   /api/v1/market/cache/clear
Body: { symbols: [] }
Response: { cleared: number }
[Internal/Admin]
```

**Cache Statistics**

text

```
GET    /api/v1/market/cache/stats
Response: { hitRate: number, size: number, entries: number }
```

### **14. Savings & Goals Service - Port 3014**

### **Goals Management**

text

```
GET    /api/v1/savings/goals
       Response: { goals: [] }

POST   /api/v1/savings/goals
       Body: {
         name: string,
         type: "travel"|"emergency"|"education"|"electronics"|"car"|"house"|"wedding"|"retirement",
         targetAmount: number,
         targetDate: string,
         priority: "low"|"medium"|"high",
         icon: string,
         color: string,
         autoSaveEnabled: boolean,
         autoSaveAmount: number,
         autoSaveFrequency: "daily"|"weekly"|"monthly"
       }
       Response: { goal }
       Calls: Automation Service (create auto-save rules)

GET    /api/v1/savings/goals/:id
       Response: { goal, progress: {}, transactions: [] }

PUT    /api/v1/savings/goals/:id
       Body: { targetAmount, targetDate, priority, ... }
       Response: { goal }

DELETE /api/v1/savings/goals/:id
       Response: { success: true }

PATCH  /api/v1/savings/goals/:id/archive
       Response: { goal }

PATCH  /api/v1/savings/goals/:id/reactivate
       Response: { goal }
```

### **Goal Transactions**

text

```
POST   /api/v1/savings/goals/:id/contribute
       Body: { amount: number, date: string, source: string, notes: string }
       Response: { transaction }
       Publishes: goal.contribution event

POST   /api/v1/savings/goals/:id/withdraw
       Body: { amount: number, reason: string, date: string }
       Response: { transaction }
       Publishes: goal.withdrawal event

GET    /api/v1/savings/goals/:id/transactions
       Query: { startDate, endDate, limit, offset }
       Response: { transactions: [], total }

POST   /api/v1/savings/goals/:id/transactions/:transactionId/revert
       Response: { success: true }
```

### **Goal Progress & Analytics**

text

```
GET    /api/v1/savings/goals/:id/progress
       Response: {
         currentAmount: number,
         targetAmount: number,
         percentage: number,
         daysRemaining: number,
         onTrack: boolean,
         projectedCompletion: string
       }

GET    /api/v1/savings/goals/:id/projection
       Response: {
         projectedCompletion: string,
         monthlySavingsRequired: number,
         confidence: number,
         scenarios: []
       }
       Calls: AI Service (prediction)

GET    /api/v1/savings/goals/:id/analytics
       Response: {
         contributionsByMonth: [],
         growthRate: number,
         milestones: [],
         consistencyScore: number
       }
```

### **Auto-Save Rules**

text

```
GET    /api/v1/savings/auto-save-rules
       Response: { rules: [] }

POST   /api/v1/savings/auto-save-rules
       Body: {
         goalId: string,
         type: "percentage"|"fixed",
         amount: number,
         frequency: "daily"|"weekly"|"monthly"|"on_salary",
         trigger: "income_received"|"first_of_month"|"custom",
         enabled: boolean
       }
       Response: { rule }
       Calls: Automation Service (create scheduled task)

PUT    /api/v1/savings/auto-save-rules/:id
       Body: { amount, frequency, enabled, ... }
       Response: { rule }

DELETE /api/v1/savings/auto-save-rules/:id
       Response: { success: true }

POST   /api/v1/savings/auto-save-rules/:id/execute-now
       Response: { success: true, transaction }
```

### **Savings Buckets**

text

```
GET    /api/v1/savings/buckets
       Response: { buckets: [] }

POST   /api/v1/savings/buckets
       Body: {
         name: string,
         description: string,
         targetPercentage: number,
         minBalance: number,
         maxBalance: number,
         priority: number,
         icon: string,
         color: string
       }
       Response: { bucket }

PUT    /api/v1/savings/buckets/:id
       Body: { targetPercentage, priority, ... }
       Response: { bucket }

DELETE /api/v1/savings/buckets/:id
       Response: { success: true }

POST   /api/v1/savings/buckets/:id/allocate
       Body: { amount: number, source: string }
       Response: { allocation }

POST   /api/v1/savings/buckets/:id/reallocate
       Body: { amount: number, targetBucketId: string }
       Response: { success: true }
```

### **Emergency Fund Management**

text

```
GET    /api/v1/savings/emergency-fund
       Response: {
         targetAmount: number,
         currentAmount: number,
         monthsCovered: number,
         recommendedAmount: number,
         status: "insufficient"|"adequate"|"optimal"
       }

POST   /api/v1/savings/emergency-fund/calculate
       Body: { monthlyExpenses: number, targetMonths: number }
       Response: { targetAmount: number }

PUT    /api/v1/savings/emergency-fund/target
       Body: { targetAmount: number }
       Response: { emergencyFund }
```

### **Round-up Savings**

text

```
GET    /api/v1/savings/round-up
       Response: {
         enabled: boolean,
         roundTo: number,
         dailyLimit: number,
         monthlyLimit: number,
         goalId: string,
         totalRounded: number
       }

POST   /api/v1/savings/round-up/enable
       Body: {
         roundTo: number,
         dailyLimit: number,
         goalId: string
       }
       Response: { settings }
       Calls: Automation Service (create expense trigger rules)

POST   /api/v1/savings/round-up/disable
       Response: { success: true }

GET    /api/v1/savings/round-up/transactions
       Query: { startDate, endDate }
       Response: { transactions: [], total: number }
```

### **Saving Challenges**

text

```
GET    /api/v1/savings/challenges
       Response: { challenges: [] }

POST   /api/v1/savings/challenges
       Body: {
         name: string,
         type: "no_spend"|"save_x"|"percentage",
         targetAmount: number,
         durationDays: number,
         startDate: string,
         rules: {},
         participants: []
       }
       Response: { challenge }

GET    /api/v1/savings/challenges/:id
       Response: { challenge, progress: {}, leaderboard: [] }

POST   /api/v1/savings/challenges/:id/join
       Response: { participation }

POST   /api/v1/savings/challenges/:id/record
       Body: { amount: number, date: string }
       Response: { record }
```

### **Savings Analytics**

text

```
GET    /api/v1/savings/analytics/overview
       Response: {
         totalSaved: number,
         byGoal: [],
         byMonth: [],
         savingsRate: number,
         projections: []
       }

GET    /api/v1/savings/analytics/timeline
       Query: { startDate, endDate }
       Response: { timeline: [] }

GET    /api/v1/savings/analytics/consistency
       Response: {
         streakDays: number,
         monthlyAverage: number,
         consistencyScore: number,
         missedMonths: []
       }
```

### **15. Family Finance Service - Port 3015**

### **Family Management**

text

```
GET    /api/v1/family
       Response: {
         family: { id, name, createdBy, createdAt },
         members: [],
         settings: {}
       }

POST   /api/v1/family
       Body: {
         name: string,
         currency: string,
         timezone: string,
         settings: {}
       }
       Response: { family }

PUT    /api/v1/family
       Body: { name, currency, timezone, settings }
       Response: { family }

DELETE /api/v1/family
       Response: { success: true }
       Calls: All services (remove family data)
```

### **Family Members**

text

```
GET    /api/v1/family/members
       Response: { members: [] }

POST   /api/v1/family/members/invite
       Body: {
         email: string,
         role: "admin"|"contributor"|"viewer",
         permissions: {}
       }
       Response: { invitation }
       Calls: User Service (get user by email)
       Calls: Notification Service (send invitation)

POST   /api/v1/family/members/accept
       Body: { invitationToken: string }
       Response: { member }

PUT    /api/v1/family/members/:memberId
       Body: { role: string, permissions: {} }
       Response: { member }

DELETE /api/v1/family/members/:memberId
       Response: { success: true }

POST   /api/v1/family/members/:memberId/leave
       Response: { success: true }
```

### **Family Budget**

text

```
GET    /api/v1/family/budget
       Response: {
         budget: {},
         spent: number,
         remaining: number,
         byCategory: {},
         byMember: {}
       }

POST   /api/v1/family/budget
       Body: {
         totalAmount: number,
         categories: { categoryId: amount }[],
         period: "monthly"|"weekly"|"yearly",
         startDate: string
       }
       Response: { budget }

PUT    /api/v1/family/budget
       Body: { totalAmount, categories, ... }
       Response: { budget }

DELETE /api/v1/family/budget
       Response: { success: true }

GET    /api/v1/family/budget/overspending-alerts
       Response: { alerts: [] }
```

### **Shared Family Expenses**

text

```
GET    /api/v1/family/expenses
       Query: {
         startDate: string,
         endDate: string,
         categoryId: string,
         memberId: string,
         status: "pending"|"approved"|"rejected",
         limit: number,
         offset: number
       }
       Response: { expenses: [], total: number }

POST   /api/v1/family/expenses
       Body: {
         amount: number,
         currency: string,
         categoryId: string,
         description: string,
         date: string,
         paidBy: string,
         splitType: "equal"|"unequal"|"custom",
         splits: { memberId: string, amount: number }[],
         requiresApproval: boolean,
         attachments: []
       }
       Response: { expense }
       Calls: Expense Service (record shared expense)
       Publishes: family.expense.created event

GET    /api/v1/family/expenses/:id
       Response: { expense, splits: [], approvals: [] }

PUT    /api/v1/family/expenses/:id
       Body: { amount, description, splits, ... }
       Response: { expense }

DELETE /api/v1/family/expenses/:id
       Response: { success: true }
```

### **Expense Approval Workflow**

text

```
POST   /api/v1/family/expenses/:expenseId/approve
       Body: { approved: boolean, notes: string }
       Response: { approval }

GET    /api/v1/family/expenses/pending-approval
       Response: { expenses: [] }

POST   /api/v1/family/expenses/:expenseId/request-changes
       Body: { changesRequested: string }
       Response: { request }

GET    /api/v1/family/expenses/:expenseId/approval-history
       Response: { history: [] }
```

### **Family Goals**

text

```
GET    /api/v1/family/goals
       Response: { goals: [] }

POST   /api/v1/family/goals
       Body: {
         name: string,
         type: "vacation"|"home"|"vehicle"|"education"|"emergency",
         targetAmount: number,
         targetDate: string,
         priority: "low"|"medium"|"high",
         contributors: string[],
         contributionType: "equal"|"percentage"|"custom"
       }
       Response: { goal }
       Calls: Savings Service (create family goal)

GET    /api/v1/family/goals/:id
       Response: { goal, contributions: [], progress: {} }

PUT    /api/v1/family/goals/:id
       Body: { targetAmount, targetDate, priority, ... }
       Response: { goal }

DELETE /api/v1/family/goals/:id
       Response: { success: true }

POST   /api/v1/family/goals/:id/contribute
       Body: { memberId: string, amount: number }
       Response: { contribution }

GET    /api/v1/family/goals/:id/contributions
       Response: { contributions: [], byMember: {} }
```

### **Child Finance Management**

text

```
GET    /api/v1/family/children
       Response: { children: [] }

POST   /api/v1/family/children
       Body: {
         name: string,
         dateOfBirth: string,
         allowanceAmount: number,
         allowanceFrequency: "weekly"|"monthly",
         savingsGoal: number,
         restrictions: {}
       }
       Response: { child }

PUT    /api/v1/family/children/:childId
       Body: { allowanceAmount, savingsGoal, ... }
       Response: { child }

DELETE /api/v1/family/children/:childId
       Response: { success: true }

POST   /api/v1/family/children/:childId/allowance
       Body: { amount: number, date: string, notes: string }
       Response: { transaction }

POST   /api/v1/family/children/:childId/expense
       Body: { amount: number, description: string, category: string }
       Response: { expense }

GET    /api/v1/family/children/:childId/spending
       Response: { totalSpent: number, byCategory: [], transactions: [] }
```

### **Family Savings Pool**

text

```
GET    /api/v1/family/savings-pool
       Response: {
         totalAmount: number,
         byMember: [],
         goals: [],
         transactions: []
       }

POST   /api/v1/family/savings-pool/contribute
       Body: { memberId: string, amount: number, purpose: string }
       Response: { contribution }

POST   /api/v1/family/savings-pool/withdraw
       Body: {
         amount: number,
         purpose: string,
         approvedBy: string[],
         notes: string
       }
       Response: { withdrawal }

GET    /api/v1/family/savings-pool/transactions
       Query: { startDate, endDate }
       Response: { transactions: [] }
```

### **Family Analytics & Reports**

text

```
GET    /api/v1/family/dashboard
       Response: {
         summary: {},
         recentExpenses: [],
         budgetStatus: {},
         goalProgress: [],
         alerts: []
       }
       Calls: Expense Service, Savings Service, Loan Service

GET    /api/v1/family/analytics/spending
       Query: { period: "month"|"quarter"|"year" }
       Response: {
         totalSpending: number,
         byCategory: [],
         byMember: [],
         trends: []
       }

GET    /api/v1/family/analytics/savings
       Response: {
         totalSavings: number,
         savingsRate: number,
         byGoal: [],
         projections: []
       }

GET    /api/v1/family/reports/monthly
       Query: { year, month }
       Response: { report }
       Calls: Report Service
```

### **Family Settings & Permissions**

text

```
GET    /api/v1/family/settings
       Response: { settings: {} }

PUT    /api/v1/family/settings
       Body: {
         requireApproval: boolean,
         approvalThreshold: number,
         budgetAlerts: boolean,
         spendingLimits: {},
         notificationPreferences: {}
       }
       Response: { settings }
```

### **16. Analytics Dashboard Service - Port 3016**

### **Comprehensive Dashboard**

text

```
GET    /api/v1/dashboard/overview
       Response: {
         netWorth: {
           current: number,
           change: number,
           history: [],
           assets: {},
           liabilities: {}
         },
         cashflow: {
           income: number,
           expenses: number,
           surplus: number,
           projections: []
         },
         investments: {
           totalValue: number,
           returns: number,
           allocation: {},
           performance: []
         },
         savings: {
           totalSaved: number,
           savingsRate: number,
           goalProgress: []
         },
         debts: {
           totalOwed: number,
           totalLent: number,
           upcomingPayments: []
         },
         alerts: []
       }
       Calls: All relevant services
```

### **Net Worth Tracking**

text

```
GET    /api/v1/analytics/net-worth
       Response: {
         total: number,
         assets: {
           cash: number,
           investments: number,
           properties: number,
           other: number
         },
         liabilities: {
           loans: number,
           creditCards: number,
           other: number
         },
         history: []
       }
       Calls: Investment Service, Loan Service, Savings Service

GET    /api/v1/analytics/net-worth/history
       Query: { startDate: string, endDate: string, interval: "daily"|"weekly"|"monthly" }
       Response: { history: [] }

POST   /api/v1/analytics/net-worth/snapshot
       Body: { date: string }
       Response: { snapshot }

GET    /api/v1/analytics/net-worth/projection
       Query: { years: number }
       Response: { projections: [] }
       Calls: AI Service (prediction)
```

### **Cashflow Analysis**

text

```
GET    /api/v1/analytics/cashflow
       Query: { period: "month"|"quarter"|"year" }
       Response: {
         income: {
           total: number,
           sources: [],
           trends: []
         },
         expenses: {
           total: number,
           categories: [],
           trends: []
         },
         netCashflow: number,
         savingsRate: number,
         dailyAverage: number
       }
       Calls: Income Service, Expense Service

GET    /api/v1/analytics/cashflow/daily
       Query: { startDate: string, endDate: string }
       Response: { daily: [] }

GET    /api/v1/analytics/cashflow/categories
       Query: { period: string }
       Response: { categories: [] }

GET    /api/v1/analytics/cashflow/income-vs-expense
       Query: { startDate: string, endDate: string }
       Response: { comparison: [] }
```

### **Spending Analytics**

text

```
GET    /api/v1/analytics/spending/overview
       Query: { period: string }
       Response: {
         total: number,
         average: number,
         byCategory: [],
         byPaymentMethod: [],
         topExpenses: [],
         trends: []
       }

GET    /api/v1/analytics/spending/categories
       Query: { period: string, limit: number }
       Response: { categories: [] }

GET    /api/v1/analytics/spending/merchants
       Query: { period: string, limit: number }
       Response: { merchants: [] }

GET    /api/v1/analytics/spending/time-analysis
       Query: { period: string }
       Response: {
         byHour: [],
         byDay: [],
         byWeekday: [],
         byMonth: []
       }

GET    /api/v1/analytics/spending/patterns
       Response: {
         patterns: [],
         recurringExpenses: [],
         anomalies: []
       }
```

### **Income Analytics**

text

```
GET    /api/v1/analytics/income/overview
       Query: { period: string }
       Response: {
         total: number,
         average: number,
         bySource: [],
         byType: [],
         trends: [],
         growth: number
       }

GET    /api/v1/analytics/income/sources
       Response: { sources: [] }

GET    /api/v1/analytics/income/projection
       Query: { months: number }
       Response: { projections: [] }
```

### **Savings & Goals Analytics**

text

```
GET    /api/v1/analytics/savings/overview
       Response: {
         totalSaved: number,
         savingsRate: number,
         byGoal: [],
         byMonth: [],
         autoSavings: number,
         consistencyScore: number
       }

GET    /api/v1/analytics/savings/goal-progress
       Response: { goals: [] }

GET    /api/v1/analytics/savings/emergency-fund
       Response: {
         currentAmount: number,
         targetAmount: number,
         monthsCovered: number,
         status: string
       }
```

### **Investment Analytics**

text

```
GET    /api/v1/analytics/investments/overview
       Response: {
         totalValue: number,
         totalInvested: number,
         totalReturns: number,
         returnPercentage: number,
         byAssetType: [],
         bySector: [],
         performance: []
       }

GET    /api/v1/analytics/investments/performance
       Query: { period: "1M"|"3M"|"6M"|"1Y"|"ALL" }
       Response: {
         returns: number,
         benchmarkComparison: {},
         topPerformers: [],
         worstPerformers: []
       }

GET    /api/v1/analytics/investments/risk
       Response: {
         volatility: number,
         sharpeRatio: number,
         maxDrawdown: number,
         diversificationScore: number,
         riskLevel: string
       }

GET    /api/v1/analytics/investments/dividends
       Query: { year: number }
       Response: { dividends: [], total: number }
```

### **Debt & Loan Analytics**

text

```
GET    /api/v1/analytics/debts/overview
       Response: {
         totalBorrowed: number,
         totalLent: number,
         netDebt: number,
         byContact: [],
         byType: [],
         upcomingPayments: []
       }

GET    /api/v1/analytics/debts/repayment-timeline
       Response: { timeline: [] }

GET    /api/v1/analytics/debts/interest-analysis
       Response: { totalInterest: number, byLoan: [] }
```

### **Tax Analytics**

text

```
GET    /api/v1/analytics/tax/overview
       Query: { taxYear: number }
       Response: {
         taxOwed: number,
         taxPaid: number,
         effectiveRate: number,
         deductions: number,
         byIncomeType: []
       }

GET    /api/v1/analytics/tax/projection
       Query: { projectedIncome: number }
       Response: { projectedTax: number }
```

### **Habit & Behavior Analytics**

text

```
GET    /api/v1/analytics/habits/overview
       Response: {
         totalSpent: number,
         byHabit: [],
         trends: [],
         savingsPotential: number,
         reductionProgress: []
       }

GET    /api/v1/analytics/habits/:habitId/detailed
       Query: { period: string }
       Response: {
         totalCost: number,
         frequency: number,
         averageDaily: number,
         trends: [],
         insights: []
       }
```

### **Financial Health Score**

text

```
GET    /api/v1/analytics/health-score
       Response: {
         score: number,
         components: {
           savingsRate: { score: number, weight: number },
           debtToIncome: { score: number, weight: number },
           emergencyFund: { score: number, weight: number },
           investmentDiversification: { score: number, weight: number },
           spendingControl: { score: number, weight: number }
         },
         overall: number,
         recommendations: []
       }
```

### **Trend Analysis & Forecasting**

text

```
GET    /api/v1/analytics/trends/spending
       Query: { months: number }
       Response: { trends: [], forecast: [] }

GET    /api/v1/analytics/trends/income
       Query: { months: number }
       Response: { trends: [], forecast: [] }

GET    /api/v1/analytics/trends/net-worth
       Query: { months: number }
       Response: { trends: [], forecast: [] }

GET    /api/v1/analytics/forecast/cashflow
       Query: { days: number }
       Response: {
         forecast: [],
         runOutDate: string,
         warnings: []
       }
```

### **Comparative Analysis**

text

```
GET    /api/v1/analytics/comparison/monthly
       Query: { months: number[] }
       Response: { comparison: [] }

GET    /api/v1/analytics/comparison/yearly
       Query: { years: number[] }
       Response: { comparison: [] }

GET    /api/v1/analytics/comparison/category
       Query: { categoryId: string, period1: string, period2: string }
       Response: { comparison: {} }
```

### **Real-time Analytics**

text

```
GET    /api/v1/analytics/realtime/spending-today
       Response: {
         total: number,
         byCategory: [],
         remainingBudget: number,
         averageComparison: number
       }

GET    /api/v1/analytics/realtime/month-progress
       Response: {
         daysPassed: number,
         daysRemaining: number,
         spentSoFar: number,
         projectedEndOfMonth: number,
         budgetStatus: string
       }
```

### **Export & Reports**

text

```
POST   /api/v1/analytics/reports/generate
       Body: {
         type: "comprehensive"|"monthly"|"tax"|"investment"|"custom",
         format: "pdf"|"excel"|"csv"|"json",
         parameters: {},
         includeCharts: boolean
       }
       Response: { jobId: string }

GET    /api/v1/analytics/reports/:reportId
       Response: { report, status, fileUrl }
```
