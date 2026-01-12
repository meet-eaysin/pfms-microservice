export class AssetPrice {
  constructor(
    public readonly symbol: string,
    public readonly price: number,
    public readonly currency: string = 'USD',
    public lastUpdated: Date = new Date()
  ) {}

  static create(symbol: string, price: number, currency: string = 'USD'): AssetPrice {
    return new AssetPrice(symbol.toUpperCase(), price, currency);
  }
}
