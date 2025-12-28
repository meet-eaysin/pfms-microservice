export class Category {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly parentId: string | null,
    public readonly icon: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
