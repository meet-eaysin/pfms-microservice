import { UUID, ISODateString } from './common';

/**
 * Analytics & AI Service Types
 */
export interface MLModel {
  _id: string;
  userId: UUID;
  modelType: 'categorization' | 'prediction' | 'anomaly';
  version: string;
  accuracy: number;
  trainedAt: ISODateString;
  features: Record<string, any>;
  weights: Record<string, any>;
}

export interface ExpenseInsight {
  _id: string;
  userId: UUID;
  insightType: 'spending_pattern' | 'savings_opportunity' | 'risk_alert' | 'anomaly';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  amount?: number;
  date: ISODateString;
  metadata?: Record<string, any>;
  isRead: boolean;
  createdAt: ISODateString;
}

export interface AIChatMessage {
  _id: string;
  userId: UUID;
  sessionId: string;
  role: 'user' | 'assistant';
  message: string;
  intent?: string;
  entities?: Record<string, any>;
  response?: {
    text: string;
    actions?: Array<{
      type: string;
      data: Record<string, any>;
    }>;
  };
  timestamp: ISODateString;
}

export interface AnalyticsCache {
  _id: string;
  userId: UUID;
  cacheKey: string;
  data: Record<string, any>;
  expiresAt: ISODateString;
  createdAt: ISODateString;
}

/**
 * Analytics DTOs
 */
export interface ChatMessageDto {
  message: string;
  sessionId?: string;
  context?: Record<string, any>;
}

export interface AutoCategorizeDto {
  description: string;
  amount?: number;
  date?: string;
  merchantInfo?: Record<string, any>;
}

export interface InsightQueryDto {
  type?: 'spending_pattern' | 'savings_opportunity' | 'risk_alert' | 'anomaly';
  category?: string;
  startDate?: string;
  endDate?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * AI Insights Response
 */
export interface AIInsight {
  id: UUID;
  type: 'spending_pattern' | 'savings_opportunity' | 'risk_alert' | 'anomaly';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  actionItems: string[];
  metadata?: Record<string, any>;
  timestamp: ISODateString;
}

/**
 * Spending Patterns
 */
export interface SpendingPattern {
  category: string;
  averageAmount: number;
  frequency: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  percentageChange: number;
  forecast: {
    nextMonthEstimate: number;
    confidence: number;
  };
}

/**
 * Savings Opportunities
 */
export interface SavingsOpportunity {
  category: string;
  currentSpending: number;
  benchmarkSpending: number;
  potentialSavings: number;
  savingsPercentage: number;
  reason: string;
  actionSuggestion: string;
}

/**
 * Risk Alerts
 */
export interface RiskAlert {
  type: 'budget_overspend' | 'unusual_pattern' | 'fraud_suspicious' | 'cash_flow_warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedArea: string;
  recommendation: string;
}

/**
 * Anomaly Detection
 */
export interface AnomalyDetection {
  type: 'transaction' | 'pattern' | 'behavior';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedTransactions: UUID[];
  confidence: number;
  suggestedAction: string;
}

/**
 * Cashflow Prediction
 */
export interface CashflowPrediction {
  date: string;
  predictedBalance: number;
  confidence: number;
  expectedIncome: number;
  expectedExpenses: number;
  netProjection: number;
}

/**
 * Financial Dashboard
 */
export interface FinancialDashboard {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  savingsRate: number;
  investments: {
    totalValue: number;
    totalReturn: number;
    returnPercentage: number;
  };
  debts: {
    totalDebt: number;
    minimumPayments: number;
  };
  insights: AIInsight[];
  alerts: RiskAlert[];
  recommendations: string[];
}
