export class Email {
  private constructor(private readonly value: string) {}

  static create(email: string): Email {
    if (!this.isValid(email)) {
      throw new Error('Invalid email format');
    }
    return new Email(email.toLowerCase());
  }

  static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}

export class Password {
  private constructor(private readonly value: string) {}

  static create(password: string): Password {
    if (!this.isValid(password)) {
      throw new Error('Invalid password: must be at least 8 characters');
    }
    return new Password(password);
  }

  static isValid(password: string): boolean {
    return password.length >= 8;
  }

  getValue(): string {
    return this.value;
  }
}

export class UserId {
  private constructor(private readonly value: string) {}

  static create(id: string): UserId {
    if (!id || id.trim().length === 0) {
      throw new Error('Invalid user ID');
    }
    return new UserId(id);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }
}
