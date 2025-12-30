import { Injectable } from '@nestjs/common';

@Injectable()
export class FinancialCalculatorService {
  // ============================================
  // FINANCIAL CALCULATIONS
  // ============================================

  /**
   * Calculate EMI (Equated Monthly Installment)
   * EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
   * P = Principal amount
   * r = Monthly interest rate (annual rate / 12 / 100)
   * n = Number of months
   */
  calculateEMI(
    principal: number,
    annualInterestRate: number,
    months: number,
  ): number {
    const monthlyRate = annualInterestRate / 12 / 100;

    if (monthlyRate === 0) {
      return principal / months;
    }

    const numerator =
      principal * monthlyRate * Math.pow(1 + monthlyRate, months);
    const denominator = Math.pow(1 + monthlyRate, months) - 1;

    return numerator / denominator;
  }

  /**
   * Calculate total interest for a loan
   */
  calculateTotalInterest(
    principal: number,
    emiAmount: number,
    numberOfEMIs: number,
  ): number {
    return emiAmount * numberOfEMIs - principal;
  }

  /**
   * Calculate compound interest
   * A = P(1 + r/n)^(nt)
   * A = Final amount
   * P = Principal
   * r = Annual interest rate (as decimal)
   * n = Number of times interest is compounded per year
   * t = Number of years
   */
  calculateCompoundInterest(
    principal: number,
    annualRate: number,
    compoundingPeriodsPerYear: number,
    years: number,
  ): {
    finalAmount: number;
    interestEarned: number;
  } {
    const rate = annualRate / 100;
    const finalAmount =
      principal *
      Math.pow(
        1 + rate / compoundingPeriodsPerYear,
        compoundingPeriodsPerYear * years,
      );

    return {
      finalAmount,
      interestEarned: finalAmount - principal,
    };
  }

  /**
   * Calculate simple interest
   * SI = (P × R × T) / 100
   * P = Principal
   * R = Rate of interest
   * T = Time period
   */
  calculateSimpleInterest(
    principal: number,
    rate: number,
    timeInYears: number,
  ): {
    interest: number;
    totalAmount: number;
  } {
    const interest = (principal * rate * timeInYears) / 100;
    const totalAmount = principal + interest;

    return {
      interest,
      totalAmount,
    };
  }

  /**
   * Calculate remaining balance after N EMIs paid
   */
  calculateRemainingBalance(
    principal: number,
    emiAmount: number,
    emisPaid: number,
    monthlyRate: number,
  ): number {
    const emiRate = monthlyRate / 100;

    if (emiRate === 0) {
      return principal - emiAmount * emisPaid;
    }

    const numerator =
      emiAmount * (Math.pow(1 + emiRate, emiRate) - Math.pow(1 + emiRate, emisPaid));
    const denominator = (1 + emiRate) * (Math.pow(1 + emiRate, emiRate) - 1);

    return numerator / denominator;
  }

  /**
   * Calculate early payoff savings
   */
  calculateEarlyPayoffSavings(
    currentBalance: number,
    monthlyEMI: number,
    monthlyRate: number,
    remainingEMIs: number,
  ): {
    earlyPaymentAmount: number;
    interestSaved: number;
    totalEMICost: number;
  } {
    const emiRate = monthlyRate / 100;
    const totalEMICost = monthlyEMI * remainingEMIs;

    // Present value of remaining EMIs
    let earlyPaymentAmount = 0;
    for (let i = 1; i <= remainingEMIs; i++) {
      earlyPaymentAmount += monthlyEMI / Math.pow(1 + emiRate, i);
    }

    const interestSaved = totalEMICost - earlyPaymentAmount;

    return {
      earlyPaymentAmount: Math.round(earlyPaymentAmount * 100) / 100,
      interestSaved: Math.round(interestSaved * 100) / 100,
      totalEMICost: Math.round(totalEMICost * 100) / 100,
    };
  }

  // ============================================
  // INVESTMENT CALCULATIONS
  // ============================================

  /**
   * Calculate profit/loss
   */
  calculateProfitLoss(
    currentValue: number,
    costPrice: number,
  ): {
    profit: number;
    profitPercentage: number;
    isProfitable: boolean;
  } {
    const profit = currentValue - costPrice;
    const profitPercentage = (profit / costPrice) * 100;

    return {
      profit,
      profitPercentage,
      isProfitable: profit > 0,
    };
  }

  /**
   * Calculate average buy price
   */
  calculateAverageBuyPrice(
    transactions: { quantity: number; price: number }[],
  ): number {
    const totalCost = transactions.reduce(
      (sum, t) => sum + t.quantity * t.price,
      0,
    );
    const totalQuantity = transactions.reduce((sum, t) => sum + t.quantity, 0);

    return totalCost / totalQuantity;
  }

  /**
   * Calculate portfolio diversification score (0-100)
   */
  calculateDiversificationScore(
    allocations: { percentage: number }[],
  ): number {
    if (allocations.length === 0) return 0;

    // Herfindahl–Hirschman Index (HHI) approach
    const hhi = allocations.reduce(
      (sum, a) => sum + Math.pow(a.percentage, 2),
      0,
    );

    // Convert HHI to diversification score
    // Perfect diversity = 1/n, so HHI = 10000/n
    const maxHHI = 10000;
    const minHHI = 10000 / allocations.length;

    const score = ((maxHHI - hhi) / (maxHHI - minHHI)) * 100;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate compound annual growth rate (CAGR)
   */
  calculateCAGR(
    startValue: number,
    endValue: number,
    years: number,
  ): number {
    const cagr = Math.pow(endValue / startValue, 1 / years) - 1;
    return cagr * 100;
  }

  // ============================================
  // EXPENSE & BUDGET CALCULATIONS
  // ============================================

  /**
   * Calculate budget remaining
   */
  calculateBudgetRemaining(
    budgetLimit: number,
    spent: number,
  ): {
    remaining: number;
    percentageUsed: number;
    percentageRemaining: number;
    isExceeded: boolean;
    exceededBy?: number;
  } {
    const remaining = budgetLimit - spent;
    const percentageUsed = (spent / budgetLimit) * 100;
    const percentageRemaining = 100 - percentageUsed;
    const isExceeded = spent > budgetLimit;

    return {
      remaining: Math.max(0, remaining),
      percentageUsed,
      percentageRemaining: Math.max(0, percentageRemaining),
      isExceeded,
      exceededBy: isExceeded ? spent - budgetLimit : undefined,
    };
  }

  /**
   * Calculate projected monthly average based on days passed
   */
  calculateProjectedMonthlyAverage(
    spent: number,
    daysPassed: number,
  ): number {
    const daysInMonth = 30;
    return (spent / daysPassed) * daysInMonth;
  }

  /**
   * Calculate expense savings
   */
  calculateSavings(
    income: number,
    expenses: number,
  ): {
    savings: number;
    savingsRate: number;
    savingsRatio: string;
  } {
    const savings = income - expenses;
    const savingsRate = (savings / income) * 100;

    return {
      savings,
      savingsRate,
      savingsRatio: `${savings}/${income}`,
    };
  }

  // ============================================
  // GOAL PROGRESS CALCULATIONS
  // ============================================

  /**
   * Calculate goal progress
   */
  calculateGoalProgress(
    currentAmount: number,
    targetAmount: number,
  ): {
    progressPercentage: number;
    remainingAmount: number;
    isCompleted: boolean;
  } {
    const progressPercentage = (currentAmount / targetAmount) * 100;
    const remainingAmount = targetAmount - currentAmount;

    return {
      progressPercentage: Math.min(100, progressPercentage),
      remainingAmount: Math.max(0, remainingAmount),
      isCompleted: currentAmount >= targetAmount,
    };
  }

  /**
   * Calculate projected goal completion date
   */
  calculateProjectedCompletionDate(
    currentAmount: number,
    targetAmount: number,
    monthlyContribution: number,
  ): {
    projectedCompletionDate: Date | null;
    monthsRemaining: number;
  } {
    const remainingAmount = targetAmount - currentAmount;

    if (monthlyContribution <= 0) {
      return {
        projectedCompletionDate: null,
        monthsRemaining: -1,
      };
    }

    const monthsRemaining = Math.ceil(remainingAmount / monthlyContribution);
    const projectedCompletionDate = new Date();
    projectedCompletionDate.setMonth(
      projectedCompletionDate.getMonth() + monthsRemaining,
    );

    return {
      projectedCompletionDate,
      monthsRemaining,
    };
  }

  // ============================================
  // PERCENTAGE & RATIO CALCULATIONS
  // ============================================

  /**
   * Calculate percentage
   */
  calculatePercentage(part: number, total: number): number {
    if (total === 0) return 0;
    return (part / total) * 100;
  }

  /**
   * Calculate percentage of amount
   */
  calculatePercentageAmount(percentage: number, total: number): number {
    return (percentage / 100) * total;
  }

  /**
   * Calculate change percentage
   */
  calculatePercentageChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) {
      return newValue > 0 ? 100 : -100;
    }

    return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
  }

  /**
   * Calculate weighted average
   */
  calculateWeightedAverage(values: number[], weights: number[]): number {
    if (values.length !== weights.length || values.length === 0) {
      return 0;
    }

    const totalWeighted = values.reduce(
      (sum, val, i) => sum + val * (weights[i] as number),
      0,
    );
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    return totalWeighted / totalWeight;
  }

  // ============================================
  // ROUNDING & FORMATTING
  // ============================================

  /**
   * Round to 2 decimal places
   */
  roundToTwo(value: number): number {
    return Math.round(value * 100) / 100;
  }

  /**
   * Round to N decimal places
   */
  roundToN(value: number, n: number = 2): number {
    return Math.round(value * Math.pow(10, n)) / Math.pow(10, n);
  }

  /**
   * Format currency
   */
  formatCurrency(
    value: number,
    currency: string = 'USD',
    locale: string = 'en-US',
  ): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(value);
  }

  /**
   * Format percentage
   */
  formatPercentage(value: number, decimals: number = 2): string {
    return `${this.roundToN(value, decimals)}%`;
  }
}
