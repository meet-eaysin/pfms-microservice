import { createLogger } from '@pfms/utils';

const logger = createLogger('CircuitBreaker');

export class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime?: number;

  constructor(
    private config: {
      threshold: number;
      timeout: number;
    }
  ) {}

  /**
   * Check if request can be executed
   */
  canExecute(): boolean {
    if (this.state === 'CLOSED') {
      return true;
    }

    if (this.state === 'OPEN') {
      // Check if timeout has passed
      if (this.lastFailureTime && Date.now() - this.lastFailureTime >= this.config.timeout) {
        logger.info('Circuit breaker transitioning to HALF_OPEN');
        this.state = 'HALF_OPEN';
        return true;
      }
      return false;
    }

    // HALF_OPEN state - allow one request through
    return true;
  }

  /**
   * Record successful request
   */
  recordSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      logger.info('Circuit breaker transitioning to CLOSED');
      this.state = 'CLOSED';
      this.failureCount = 0;
    }
  }

  /**
   * Record failed request
   */
  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.config.threshold) {
      if (this.state !== 'OPEN') {
        logger.warn('Circuit breaker transitioning to OPEN', {
          failures: this.failureCount,
        });
        this.state = 'OPEN';
      }
    }
  }

  /**
   * Get current state
   */
  getState(): string {
    return this.state;
  }
}
