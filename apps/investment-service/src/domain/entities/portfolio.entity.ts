export class Portfolio {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public name: string,
    public description?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
