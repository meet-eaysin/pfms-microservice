import { format, addDays, addMonths, differenceInDays, parseISO } from 'date-fns';

export class DateUtil {
  /**
   * Format date to string
   */
  static format(date: Date, formatStr: string = 'yyyy-MM-dd'): string {
    return format(date, formatStr);
  }

  /**
   * Add days to date
   */
  static addDays(date: Date, days: number): Date {
    return addDays(date, days);
  }

  /**
   * Add months to date
   */
  static addMonths(date: Date, months: number): Date {
    return addMonths(date, months);
  }

  /**
   * Calculate difference in days
   */
  static differenceInDays(dateLeft: Date, dateRight: Date): number {
    return differenceInDays(dateLeft, dateRight);
  }

  /**
   * Parse ISO string to Date
   */
  static parseISO(dateString: string): Date {
    return parseISO(dateString);
  }

  /**
   * Get start of day
   */
  static startOfDay(date: Date = new Date()): Date {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }

  /**
   * Get end of day
   */
  static endOfDay(date: Date = new Date()): Date {
    const newDate = new Date(date);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
  }

  /**
   * Get start of month
   */
  static startOfMonth(date: Date = new Date()): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  /**
   * Get end of month
   */
  static endOfMonth(date: Date = new Date()): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  /**
   * Check if date is in the past
   */
  static isPast(date: Date): boolean {
    return date < new Date();
  }

  /**
   * Check if date is in the future
   */
  static isFuture(date: Date): boolean {
    return date > new Date();
  }
}
