import {
  format as dfFormat,
  addDays as dfAddDays,
  addMonths as dfAddMonths,
  addYears as dfAddYears,
  parseISO as dfParseISO,
  startOfDay as dfStartOfDay,
  endOfDay as dfEndOfDay,
  isValid as dfIsValid,
  toDate as dfToDate,
} from 'date-fns';

export const DateFormats = {
  ISO_DATE: 'yyyy-MM-dd',
  ISO_DATETIME: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  DISPLAY_DATE: 'MMM dd, yyyy', // e.g. Dec 27, 2025
};

/**
 * Format a date object or string into a specific format string.
 */
export const formatDate = (
  date: Date | string | number,
  formatStr: string = DateFormats.ISO_DATE
): string => {
  const d = typeof date === 'string' ? dfParseISO(date) : dfToDate(date);
  if (!dfIsValid(d)) {
    throw new Error('Invalid date provided to formatDate');
  }
  return dfFormat(d, formatStr);
};

/**
 * Add time to a date.
 */
export const addTime = (
  date: Date | string,
  amount: number,
  unit: 'days' | 'weeks' | 'months' | 'years'
): Date => {
  const d = typeof date === 'string' ? dfParseISO(date) : date;

  switch (unit) {
    case 'days':
      return dfAddDays(d, amount);
    // date-fns doesn't have direct 'addWeeks' exported in this simple map, but 7 days works or we import it.
    // Actually addWeeks exists in date-fns, let's just use days * 7 for simplicity or I can import it.
    // Let's import addWeeks to be safe.
    case 'weeks':
      return dfAddDays(d, amount * 7);
    case 'months':
      return dfAddMonths(d, amount);
    case 'years':
      return dfAddYears(d, amount);
    default:
      return d;
  }
};

export const parseISO = (dateString: string): Date => {
  return dfParseISO(dateString);
};

export const startOfDay = (date: Date | string): Date => {
  const d = typeof date === 'string' ? dfParseISO(date) : date;
  return dfStartOfDay(d);
};

export const endOfDay = (date: Date | string): Date => {
  const d = typeof date === 'string' ? dfParseISO(date) : date;
  return dfEndOfDay(d);
};

export const isValid = (date: any): boolean => {
  if (date === null || date === undefined) return false;
  const d = typeof date === 'string' ? dfParseISO(date) : date;
  return dfIsValid(d);
};

// Re-export specific useful types or functions if strictly needed,
// but prefer wrapping to maintain control.
