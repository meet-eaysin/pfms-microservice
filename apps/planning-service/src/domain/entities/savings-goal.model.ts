export class SavingsGoal {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly targetAmount: number,
    public readonly currentAmount: number,
    public readonly deadline: Date | null,
    public readonly isCompleted: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  getProgress(): number {
    return (this.currentAmount / this.targetAmount) * 100;
  }

  getRemainingAmount(): number {
    return Math.max(0, this.targetAmount - this.currentAmount);
  }

  getDaysRemaining(): number | null {
    if (!this.deadline) return null;
    const now = new Date();
    const diff = this.deadline.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  isOnTrack(): boolean {
    if (!this.deadline || this.isCompleted) return true;

    const daysRemaining = this.getDaysRemaining();
    if (daysRemaining === null || daysRemaining <= 0) return false;

    const progress = this.getProgress();
    const totalDays = (this.deadline.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const daysPassed = totalDays - daysRemaining;
    const expectedProgress = (daysPassed / totalDays) * 100;

    return progress >= expectedProgress;
  }
}
