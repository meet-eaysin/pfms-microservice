import { UUID, ISODateString, Decimal } from './common';

/**
 * Tax Service Types
 */
export interface TaxProfile {
  id: UUID;
  userId: UUID;
  countryCode: string;
  region?: string;
  taxYear: number;
  filingStatus?: string;
  dependents: number;
  customRules?: Record<string, any>;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface TaxBracket {
  id: UUID;
  countryCode: string;
  taxYear: number;
  minIncome: Decimal;
  maxIncome?: Decimal;
  taxRate: Decimal;
  bracketType: 'income' | 'capital_gains';
  createdAt: ISODateString;
}

export interface TaxDeduction {
  id: UUID;
  userId: UUID;
  taxYear: number;
  category: string;
  amount: Decimal;
  description?: string;
  date?: string;
  documentUrl?: string;
  status: 'claimed' | 'approved' | 'rejected';
  createdAt: ISODateString;
}

export interface TaxCalculation {
  id: UUID;
  userId: UUID;
  taxYear: number;
  totalIncome?: Decimal;
  taxableIncome?: Decimal;
  totalDeductions?: Decimal;
  taxOwed?: Decimal;
  capitalGainsTax?: Decimal;
  calculationDetails?: Record<string, any>;
  calculatedAt: ISODateString;
}

/**
 * Tax DTOs
 */
export interface CreateTaxProfileDto {
  countryCode: string;
  region?: string;
  taxYear: number;
  filingStatus?: string;
  dependents?: number;
}

export interface AddDeductionDto {
  category: string;
  amount: Decimal;
  description?: string;
  date?: string;
  documentUrl?: string;
}

export interface TaxCalculationParams {
  taxYear: number;
  includeCapitalGains?: boolean;
  includeDeductions?: boolean;
}

/**
 * Tax Analytics
 */
export interface TaxSummary {
  taxYear: number;
  totalIncome: Decimal;
  taxableIncome: Decimal;
  totalDeductions: Decimal;
  taxOwed: Decimal;
  effectiveTaxRate: number;
  capitalGainsTax?: Decimal;
  estimatedRefund?: Decimal;
  deductionsByCategory: Array<{
    category: string;
    amount: Decimal;
    percentage: number;
  }>;
}

export interface TaxProjection {
  projectedIncome: Decimal;
  projectedTax: Decimal;
  projectedDeductions: Decimal;
  estimatedTaxLiability: Decimal;
  recommendedQuarterlyPayment?: Decimal;
}

export interface DeductionOpportunity {
  category: string;
  suggestedAmount: Decimal;
  reason: string;
  priority: 'low' | 'medium' | 'high';
}
