import Redis from 'ioredis';
import { createLogger } from '@pfms/utils';
import { SagaState, SagaStatus, SagaConfig } from './types';

const logger = createLogger('SagaStateManager');

export class SagaStateManager {
  private redis: Redis | null = null;
  private statePrefix: string;
  private inMemoryStates: Map<string, SagaState> = new Map();

  constructor(config: SagaConfig) {
    this.statePrefix = config.statePrefix;

    // Initialize Redis if config provided
    if (config.redis) {
      this.redis = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
      });
    }
  }

  /**
   * Initialize saga state
   */
  async initializeState(sagaId: string, metadata?: Record<string, unknown>): Promise<void> {
    const state: SagaState = {
      sagaId,
      status: SagaStatus.PENDING,
      currentStep: 0,
      completedSteps: [],
      startedAt: new Date().toISOString(),
      metadata,
    };

    await this.saveState(sagaId, state);
    logger.info('📝 Saga state initialized', { sagaId });
  }

  /**
   * Get saga state
   */
  async getState(sagaId: string): Promise<SagaState | null> {
    if (this.redis) {
      const key = this.getKey(sagaId);
      const data = await this.redis.get(key);

      if (!data) {
        return null;
      }

      return JSON.parse(data) as SagaState;
    } else {
      // Use in-memory storage
      return this.inMemoryStates.get(sagaId) || null;
    }
  }

  /**
   * Save saga state
   */
  async saveState(sagaId: string, state: SagaState): Promise<void> {
    if (this.redis) {
      const key = this.getKey(sagaId);
      await this.redis.set(key, JSON.stringify(state), 'EX', 86400); // 24 hours TTL
    } else {
      // Use in-memory storage
      this.inMemoryStates.set(sagaId, state);
    }
  }

  /**
   * Update saga status
   */
  async updateStatus(sagaId: string, status: SagaStatus): Promise<void> {
    const state = await this.getState(sagaId);
    if (!state) {
      throw new Error(`Saga state not found: ${sagaId}`);
    }

    state.status = status;

    if (status === SagaStatus.COMPLETED || status === SagaStatus.COMPENSATED) {
      state.completedAt = new Date().toISOString();
    }

    await this.saveState(sagaId, state);
    logger.info('📊 Saga status updated', { sagaId, status });
  }

  /**
   * Mark step as completed
   */
  async markStepCompleted(sagaId: string, stepName: string): Promise<void> {
    const state = await this.getState(sagaId);
    if (!state) {
      throw new Error(`Saga state not found: ${sagaId}`);
    }

    state.completedSteps.push(stepName);
    state.currentStep++;

    await this.saveState(sagaId, state);
  }

  /**
   * Mark step as failed
   */
  async markStepFailed(sagaId: string, stepName: string, error: unknown): Promise<void> {
    const state = await this.getState(sagaId);
    if (!state) {
      throw new Error(`Saga state not found: ${sagaId}`);
    }

    state.failedStep = stepName;
    state.error = error instanceof Error ? error.message : String(error);

    await this.saveState(sagaId, state);
  }

  /**
   * Get Redis key for saga
   */
  private getKey(sagaId: string): string {
    return `${this.statePrefix}:${sagaId}`;
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}
