const VALID_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'AUD',
  'CAD',
  'CHF',
  'CNY',
  'INR',
  'BRL',
] as const;

export type CurrencyCode = (typeof VALID_CURRENCIES)[number];

export class Currency {
  private constructor(private readonly value: CurrencyCode) {}

  static create(code: string): Currency {
    const upperCode = code.toUpperCase();
    if (!this.isValid(upperCode)) {
      throw new Error(`Invalid currency code: ${code}`);
    }
    return new Currency(upperCode as CurrencyCode);
  }

  static isValid(code: string): code is CurrencyCode {
    return VALID_CURRENCIES.includes(code as CurrencyCode);
  }

  getValue(): CurrencyCode {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: Currency): boolean {
    return this.value === other.value;
  }
}
