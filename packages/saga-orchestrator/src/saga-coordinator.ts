import { randomUUID } from 'crypto';
import { createLogger } from '@pfms/utils';
import { SagaStateManager } from './saga-state-manager';
import { CompensationHandler } from './compensation-handler';
import { TimeoutManager } from './timeout-manager';
import { SagaStep, SagaStatus, SagaConfig } from './types';

const logger = createLogger('SagaCoordinator');

export abstract class SagaCoordinator {
  protected stateManager: SagaStateManager;
  protected compensationHandler: CompensationHandler;
  protected timeoutManager: TimeoutManager;
  protected steps: SagaStep[] = [];

  constructor(protected config: SagaConfig) {
    this.stateManager = new SagaStateManager(config);
    this.compensationHandler = new CompensationHandler(this.stateManager);
    this.timeoutManager = new TimeoutManager(config.defaultTimeout);
  }

  /**
   * Generate unique saga ID
   */
  protected generateSagaId(): string {
    return `saga:${randomUUID()}`;
  }

  /**
   * Execute a saga step with timeout and error handling
   */
  protected async executeStep(
    sagaId: string,
    stepName: string,
    execute: () => Promise<unknown>,
    compensate?: () => Promise<void>,
    timeout?: number
  ): Promise<unknown> {
    logger.info('🔄 Executing saga step', { sagaId, stepName });

    try {
      // Update state to in-progress
      await this.stateManager.updateStatus(sagaId, SagaStatus.IN_PROGRESS);

      // Execute with timeout
      const result = await this.timeoutManager.executeWithTimeout(
        execute,
        timeout || this.config.defaultTimeout,
        `Step ${stepName} timed out`
      );

      // Mark step as completed
      await this.stateManager.markStepCompleted(sagaId, stepName);

      logger.info('✅ Saga step completed', { sagaId, stepName });

      return result;
    } catch (error) {
      logger.error('❌ Saga step failed', {
        sagaId,
        stepName,
        error,
      });

      // Mark step as failed
      await this.stateManager.markStepFailed(sagaId, stepName, error);

      // Register compensation if provided
      if (compensate) {
        this.compensationHandler.registerCompensation(sagaId, stepName, compensate);
      }

      throw error;
    }
  }

  /**
   * Complete saga successfully
   */
  protected async completeSaga(sagaId: string): Promise<void> {
    logger.info('🎉 Saga completed successfully', { sagaId });
    await this.stateManager.updateStatus(sagaId, SagaStatus.COMPLETED);
  }

  /**
   * Compensate saga (rollback)
   */
  protected async compensate(sagaId: string): Promise<void> {
    logger.warn('⚠️  Starting saga compensation', { sagaId });

    try {
      await this.stateManager.updateStatus(sagaId, SagaStatus.COMPENSATING);
      await this.compensationHandler.compensate(sagaId);
      await this.stateManager.updateStatus(sagaId, SagaStatus.COMPENSATED);

      logger.info('✅ Saga compensated successfully', { sagaId });
    } catch (error) {
      logger.error('❌ Compensation failed', { sagaId, error });
      await this.stateManager.updateStatus(sagaId, SagaStatus.FAILED);
      throw error;
    }
  }

  /**
   * Get saga state
   */
  async getSagaState(sagaId: string) {
    return this.stateManager.getState(sagaId);
  }

  /**
   * Abstract method to be implemented by concrete sagas
   */
  abstract execute(...args: unknown[]): Promise<unknown>;
}
