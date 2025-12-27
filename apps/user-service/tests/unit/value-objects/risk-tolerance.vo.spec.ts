import { describe, it, expect } from '@jest/globals';
import { RiskTolerance } from '../../../src/domain/value-objects/risk-tolerance.vo';

describe('RiskTolerance Value Object', () => {
  describe('create', () => {
    it('should create valid risk tolerance levels', () => {
      const low = RiskTolerance.create('LOW');
      const medium = RiskTolerance.create('MEDIUM');
      const high = RiskTolerance.create('HIGH');

      expect(low.getValue()).toBe('LOW');
      expect(medium.getValue()).toBe('MEDIUM');
      expect(high.getValue()).toBe('HIGH');
    });

    it('should handle lowercase input', () => {
      const risk = RiskTolerance.create('low');
      expect(risk.getValue()).toBe('LOW');
    });

    it('should throw error for invalid level', () => {
      expect(() => RiskTolerance.create('INVALID')).toThrow(
        'Invalid risk tolerance level: INVALID'
      );
    });
  });

  describe('equals', () => {
    it('should return true for same level', () => {
      const low1 = RiskTolerance.create('LOW');
      const low2 = RiskTolerance.create('LOW');
      expect(low1.equals(low2)).toBe(true);
    });

    it('should return false for different levels', () => {
      const low = RiskTolerance.create('LOW');
      const high = RiskTolerance.create('HIGH');
      expect(low.equals(high)).toBe(false);
    });
  });

  describe('isValid', () => {
    it('should validate correct levels', () => {
      expect(RiskTolerance.isValid('LOW')).toBe(true);
      expect(RiskTolerance.isValid('MEDIUM')).toBe(true);
      expect(RiskTolerance.isValid('HIGH')).toBe(true);
    });

    it('should reject invalid levels', () => {
      expect(RiskTolerance.isValid('INVALID')).toBe(false);
      expect(RiskTolerance.isValid('MODERATE')).toBe(false);
    });
  });
});
