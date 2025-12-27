export type RiskToleranceLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export class RiskTolerance {
  private constructor(private readonly value: RiskToleranceLevel) {}

  static create(level: string): RiskTolerance {
    const upperLevel = level.toUpperCase();
    if (!this.isValid(upperLevel)) {
      throw new Error(`Invalid risk tolerance level: ${level}`);
    }
    return new RiskTolerance(upperLevel as RiskToleranceLevel);
  }

  static isValid(level: string): level is RiskToleranceLevel {
    return ['LOW', 'MEDIUM', 'HIGH'].includes(level);
  }

  getValue(): RiskToleranceLevel {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: RiskTolerance): boolean {
    return this.value === other.value;
  }
}
