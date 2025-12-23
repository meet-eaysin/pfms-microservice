import { UUID, ISODateString } from './common';

/**
 * Report Service Types
 */
export interface GeneratedReport {
  id: UUID;
  userId: UUID;
  reportType: 'monthly' | 'tax' | 'portfolio' | 'custom' | 'cashflow' | 'spending';
  format: 'pdf' | 'xlsx' | 'csv' | 'json';
  parameters?: Record<string, any>;
  fileUrl?: string;
  fileSize?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  generatedAt?: ISODateString;
  expiresAt?: ISODateString;
  createdAt: ISODateString;
}

export interface ReportTemplate {
  id: UUID;
  userId: UUID;
  name: string;
  description?: string;
  reportType: 'monthly' | 'tax' | 'portfolio' | 'custom' | 'cashflow' | 'spending';
  format: 'pdf' | 'xlsx' | 'csv' | 'json';
  layout?: string;
  sections: string[];
  includeCharts: boolean;
  customCSS?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface ReportSchedule {
  id: UUID;
  userId: UUID;
  templateId?: UUID;
  reportType: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  deliveryDate?: number; // day of month/week
  deliveryTime?: string; // HH:mm format
  deliveryChannels: ('email' | 'download' | 'webhook')[];
  isActive: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/**
 * Report DTOs
 */
export interface GenerateReportDto {
  reportType: 'monthly' | 'tax' | 'portfolio' | 'custom' | 'cashflow' | 'spending';
  format?: 'pdf' | 'xlsx' | 'csv' | 'json';
  parameters?: {
    startDate?: string;
    endDate?: string;
    categories?: string[];
    includeCharts?: boolean;
    templateId?: UUID;
    customTitle?: string;
  };
}

export interface CreateReportTemplateDto {
  name: string;
  description?: string;
  reportType: 'monthly' | 'tax' | 'portfolio' | 'custom' | 'cashflow' | 'spending';
  format: 'pdf' | 'xlsx' | 'csv' | 'json';
  layout?: string;
  sections: string[];
  includeCharts?: boolean;
  customCSS?: string;
}

export interface ScheduleReportDto {
  templateId?: UUID;
  reportType: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  deliveryDate?: number;
  deliveryTime?: string;
  deliveryChannels: ('email' | 'download' | 'webhook')[];
}

/**
 * Report Content
 */
export interface MonthlyReport {
  period: {
    month: string;
    year: number;
  };
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
    savingsRate: number;
  };
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  topExpenses: Array<{
    description: string;
    amount: number;
    date: string;
  }>;
  trends: {
    comparedToLastMonth: {
      incomeChange: number;
      expenseChange: number;
    };
    comparedToLastYear: {
      incomeChange: number;
      expenseChange: number;
    };
  };
  goals: Array<{
    name: string;
    progress: number;
    onTrack: boolean;
  }>;
  alerts: string[];
  recommendations: string[];
}

export interface TaxReport {
  taxYear: number;
  totalIncome: number;
  taxableIncome: number;
  totalDeductions: number;
  taxOwed: number;
  deductionsByCategory: Array<{
    category: string;
    amount: number;
  }>;
  capitalGains?: number;
  estimatedTaxLiability: number;
  estimatedRefund?: number;
}

export interface PortfolioReport {
  portfolio: {
    name: string;
    totalValue: number;
    totalInvested: number;
    totalReturn: number;
    returnPercentage: number;
  };
  assets: Array<{
    symbol: string;
    quantity: number;
    currentValue: number;
    unrealizedReturn: number;
    allocationPercentage: number;
  }>;
  performance: {
    yearToDateReturn: number;
    oneYearReturn: number;
    threeYearReturn?: number;
  };
  dividends: number;
  taxableGains: number;
}

/**
 * Export Formats
 */
export interface ExportOptions {
  format: 'pdf' | 'xlsx' | 'csv' | 'json';
  includeCharts?: boolean;
  pageSize?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
  compression?: boolean;
}
