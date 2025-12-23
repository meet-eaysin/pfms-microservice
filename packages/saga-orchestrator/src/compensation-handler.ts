import { createLogger } from '@pfms/utils';
import { SagaStateManager } from './saga-state-manager';

const logger = createLogger('CompensationHandler');

export class CompensationHandler {
  private compensations: Map<string, Array<{ step: string; fn: () => Promise<void> }>> = new Map();

  constructor(private stateManager: SagaStateManager) {}

  /**
   * Register compensation function for a step
   */
  registerCompensation(sagaId: string, step: string, fn: () => Promise<void>): void {
    if (!this.compensations.has(sagaId)) {
      this.compensations.set(sagaId, []);
    }

    this.compensations.get(sagaId)!.push({ step, fn });
    logger.debug('📋 Compensation registered', { sagaId, step });
  }

  /**
   * Execute all compensations in reverse order
   */
  async compensate(sagaId: string): Promise<void> {
    const compensations = this.compensations.get(sagaId);

    if (!compensations || compensations.length === 0) {
      logger.info('ℹ️  No compensations to execute', { sagaId });
      return;
    }

    logger.info('🔄 Executing compensations', {
      sagaId,
      count: compensations.length,
    });

    // Execute in reverse order (LIFO)
    const reversed = [...compensations].reverse();

    for (const { step, fn } of reversed) {
      try {
        logger.info('⏪ Compensating step', { sagaId, step });
        await fn();
        logger.info('✅ Step compensated', { sagaId, step });
      } catch (error) {
        logger.error('❌ Compensation failed', {
          sagaId,
          step,
          error,
        });
        // Continue with other compensations even if one fails
      }
    }

    // Clean up
    this.compensations.delete(sagaId);
  }
}
