import { Request, Response } from 'express';
import { createLogger } from '@pfms/config';
import { HttpStatus } from '@pfms/http';
import type { GetPriceUseCase } from '@/application/use-cases/get-price.use-case';
import type { SearchSymbolsUseCase } from '@/application/use-cases/search-symbols.use-case';
import type { GetHistoricalDataUseCase } from '@/application/use-cases/get-historical-data.use-case';
import type { IServiceContainer } from '@/infrastructure/di/container';

const logger = createLogger('MarketController');

export class MarketController {
  constructor(
    private readonly getPriceUseCase: GetPriceUseCase,
    private readonly searchSymbolsUseCase: SearchSymbolsUseCase,
    private readonly getHistoricalDataUseCase: GetHistoricalDataUseCase
  ) {}

  async getPrice(req: Request, res: Response): Promise<void> {
    const { symbol } = req.params;

    if (!symbol) {
      res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Symbol parameter is required',
      });
      return;
    }

    const isCrypto = req.query.type === 'crypto';

    try {
      const price = await this.getPriceUseCase.execute(symbol, isCrypto);
      if (!price) {
        res.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: `Price for symbol ${symbol} not found`,
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        data: price,
      });
    } catch (error) {
      logger.error('Error fetching price', { symbol, error });
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      });
    }
  }

  async searchSymbols(req: Request, res: Response): Promise<void> {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Query parameter q is required',
      });
      return;
    }

    try {
      const symbols = await this.searchSymbolsUseCase.execute(q);
      res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        data: symbols,
      });
    } catch (error) {
      logger.error('Error searching symbols', { q, error });
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      });
    }
  }

  async getHistoricalData(req: Request, res: Response): Promise<void> {
    const { symbol } = req.params;

    if (!symbol) {
      res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Symbol parameter is required',
      });
      return;
    }

    const { start, end, type } = req.query;
    const isCrypto = type === 'crypto';

    if (!start || !end) {
      res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Query parameters start and end (ISO dates) are required',
      });
      return;
    }

    try {
      const startDate = new Date(start as string);
      const endDate = new Date(end as string);

      const data = await this.getHistoricalDataUseCase.execute(
        symbol,
        startDate,
        endDate,
        isCrypto
      );
      res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        data,
      });
    } catch (error) {
      logger.error('Error fetching historical data', { symbol, error });
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      });
    }
  }
}

export function createMarketController(container: IServiceContainer): MarketController {
  return new MarketController(
    container.useCases.getPrice,
    container.useCases.searchSymbols,
    container.useCases.getHistoricalData
  );
}
