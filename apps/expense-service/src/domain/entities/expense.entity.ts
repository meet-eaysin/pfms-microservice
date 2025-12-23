export class Expense {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public amount: number,
    public currency: string,
    public description: string,
    public categoryId: string | null,
    public tags: string[],
    public date: Date,
    public source: string,
    public isRecurring: boolean,
    public recurringRuleId: string | null,
    public attachments: string[],
    public readonly createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null = null
  ) {}

  /**
   * Mark expense as deleted (soft delete)
   */
  delete(): void {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Update expense details
   */
  update(
    data: Partial<{
      amount: number;
      currency: string;
      description: string;
      categoryId: string | null;
      tags: string[];
      date: Date;
    }>
  ): void {
    if (data.amount !== undefined) this.amount = data.amount;
    if (data.currency !== undefined) this.currency = data.currency;
    if (data.description !== undefined) this.description = data.description;
    if (data.categoryId !== undefined) this.categoryId = data.categoryId;
    if (data.tags !== undefined) this.tags = data.tags;
    if (data.date !== undefined) this.date = data.date;

    this.updatedAt = new Date();
  }

  /**
   * Check if expense is deleted
   */
  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  /**
   * Add attachment URL
   */
  addAttachment(url: string): void {
    this.attachments.push(url);
    this.updatedAt = new Date();
  }

  /**
   * Add tag
   */
  addTag(tag: string): void {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
      this.updatedAt = new Date();
    }
  }

  /**
   * Remove tag
   */
  removeTag(tag: string): void {
    this.tags = this.tags.filter((t) => t !== tag);
    this.updatedAt = new Date();
  }
}
