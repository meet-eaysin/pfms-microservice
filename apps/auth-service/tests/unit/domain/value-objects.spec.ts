import { Email, Password, UserId } from '../../../src/domain/value-objects/auth.value-objects';

describe('Email Value Object', () => {
  describe('create', () => {
    it('should create valid email', () => {
      const email = Email.create('test@example.com');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should convert email to lowercase', () => {
      const email = Email.create('TEST@EXAMPLE.COM');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should throw error for invalid email', () => {
      expect(() => Email.create('invalid-email')).toThrow('Invalid email format');
    });

    it('should throw error for empty email', () => {
      expect(() => Email.create('')).toThrow('Invalid email format');
    });
  });

  describe('equals', () => {
    it('should return true for equal emails', () => {
      const email1 = Email.create('test@example.com');
      const email2 = Email.create('test@example.com');
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different emails', () => {
      const email1 = Email.create('test1@example.com');
      const email2 = Email.create('test2@example.com');
      expect(email1.equals(email2)).toBe(false);
    });
  });
});

describe('Password Value Object', () => {
  describe('create', () => {
    it('should create valid password', () => {
      const password = Password.create('ValidPass123!');
      expect(password.getValue()).toBe('ValidPass123!');
    });

    it('should throw error for short password', () => {
      expect(() => Password.create('short')).toThrow(
        'Invalid password: must be at least 8 characters',
      );
    });

    it('should throw error for empty password', () => {
      expect(() => Password.create('')).toThrow(
        'Invalid password: must be at least 8 characters',
      );
    });
  });

  describe('isValid', () => {
    it('should validate password length', () => {
      expect(Password.isValid('ValidPass123!')).toBe(true);
      expect(Password.isValid('short')).toBe(false);
    });
  });
});

describe('UserId Value Object', () => {
  describe('create', () => {
    it('should create valid user ID', () => {
      const userId = UserId.create('user-123');
      expect(userId.getValue()).toBe('user-123');
    });

    it('should throw error for empty ID', () => {
      expect(() => UserId.create('')).toThrow('Invalid user ID');
    });

    it('should throw error for whitespace ID', () => {
      expect(() => UserId.create('   ')).toThrow('Invalid user ID');
    });
  });

  describe('equals', () => {
    it('should return true for equal IDs', () => {
      const id1 = UserId.create('user-123');
      const id2 = UserId.create('user-123');
      expect(id1.equals(id2)).toBe(true);
    });

    it('should return false for different IDs', () => {
      const id1 = UserId.create('user-123');
      const id2 = UserId.create('user-456');
      expect(id1.equals(id2)).toBe(false);
    });
  });
});
