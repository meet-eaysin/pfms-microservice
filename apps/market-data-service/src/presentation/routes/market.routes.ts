import { Router } from 'express';
import type { MarketController } from '../controllers/market.controller';

export function createMarketRouter(controller: MarketController): Router {
  const router = Router();

  router.get('/price/:symbol', (req, res) => controller.getPrice(req, res));
  router.get('/search', (req, res) => controller.searchSymbols(req, res));
  router.get('/history/:symbol', (req, res) => controller.getHistoricalData(req, res));

  return router;
}
