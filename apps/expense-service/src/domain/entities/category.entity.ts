export class Category {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public name: string,
    public description: string | null,
    public icon: string | null,
    public color: string | null,
    public parentId: string | null,
    public monthlyBudget: number | null,
    public expenseCount: number,
    public totalAmount: number,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  /**
   * Update category details
   */
  update(
    data: Partial<{
      name: string;
      description: string | null;
      icon: string | null;
      color: string | null;
      monthlyBudget: number | null;
    }>
  ): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.description !== undefined) this.description = data.description;
    if (data.icon !== undefined) this.icon = data.icon;
    if (data.color !== undefined) this.color = data.color;
    if (data.monthlyBudget !== undefined) this.monthlyBudget = data.monthlyBudget;

    this.updatedAt = new Date();
  }

  /**
   * Increment expense count and total amount
   */
  addExpense(amount: number): void {
    this.expenseCount++;
    this.totalAmount += amount;
    this.updatedAt = new Date();
  }

  /**
   * Decrement expense count and total amount
   */
  removeExpense(amount: number): void {
    this.expenseCount = Math.max(0, this.expenseCount - 1);
    this.totalAmount = Math.max(0, this.totalAmount - amount);
    this.updatedAt = new Date();
  }

  /**
   * Check if budget is exceeded
   */
  isBudgetExceeded(): boolean {
    if (!this.monthlyBudget) return false;
    return this.totalAmount > this.monthlyBudget;
  }

  /**
   * Get budget utilization percentage
   */
  getBudgetUtilization(): number | null {
    if (!this.monthlyBudget) return null;
    return (this.totalAmount / this.monthlyBudget) * 100;
  }
}
