export class Asset {
  constructor(
    public readonly id: string,
    public readonly portfolioId: string,
    public symbol: string,
    public assetType: string,
    public quantity: number,
    public averageBuyPrice: number,
    public currency: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
