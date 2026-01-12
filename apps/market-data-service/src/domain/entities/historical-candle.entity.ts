export class HistoricalCandle {
  constructor(
    public readonly symbol: string,
    public readonly date: Date,
    public readonly open: number,
    public readonly high: number,
    public readonly low: number,
    public readonly close: number,
    public readonly volume: bigint
  ) {}

  static create(
    symbol: string,
    date: Date,
    open: number,
    high: number,
    low: number,
    close: number,
    volume: bigint
  ): HistoricalCandle {
    return new HistoricalCandle(symbol.toUpperCase(), date, open, high, low, close, volume);
  }
}
