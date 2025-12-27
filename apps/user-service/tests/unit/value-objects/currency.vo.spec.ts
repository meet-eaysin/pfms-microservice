import { describe, it, expect } from '@jest/globals';
import { Currency } from '../../../src/domain/value-objects/currency.vo';

describe('Currency Value Object', () => {
  describe('create', () => {
    it('should create valid currency', () => {
      const currency = Currency.create('USD');
      expect(currency.getValue()).toBe('USD');
      expect(currency.toString()).toBe('USD');
    });

    it('should handle lowercase input', () => {
      const currency = Currency.create('eur');
      expect(currency.getValue()).toBe('EUR');
    });

    it('should throw error for invalid currency', () => {
      expect(() => Currency.create('INVALID')).toThrow('Invalid currency code: INVALID');
    });

    it('should support all major currencies', () => {
      const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'BRL'];

      currencies.forEach((code) => {
        const currency = Currency.create(code);
        expect(currency.getValue()).toBe(code);
      });
    });
  });

  describe('equals', () => {
    it('should return true for same currency', () => {
      const usd1 = Currency.create('USD');
      const usd2 = Currency.create('USD');
      expect(usd1.equals(usd2)).toBe(true);
    });

    it('should return false for different currencies', () => {
      const usd = Currency.create('USD');
      const eur = Currency.create('EUR');
      expect(usd.equals(eur)).toBe(false);
    });
  });

  describe('isValid', () => {
    it('should validate correct currency codes', () => {
      expect(Currency.isValid('USD')).toBe(true);
      expect(Currency.isValid('EUR')).toBe(true);
    });

    it('should reject invalid currency codes', () => {
      expect(Currency.isValid('INVALID')).toBe(false);
      expect(Currency.isValid('US')).toBe(false);
    });
  });
});
