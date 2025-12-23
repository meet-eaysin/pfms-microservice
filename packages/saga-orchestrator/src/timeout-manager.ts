import { createLogger } from '@pfms/utils';

const logger = createLogger('TimeoutManager');

export class TimeoutManager {
  constructor(private defaultTimeout: number) {}

  /**
   * Execute function with timeout
   */
  async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeout: number,
    errorMessage: string
  ): Promise<T> {
    return Promise.race([fn(), this.createTimeout(timeout, errorMessage)]) as Promise<T>;
  }

  /**
   * Create timeout promise
   */
  private createTimeout(ms: number, message: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        logger.error('⏱️  Timeout exceeded', { timeout: ms, message });
        reject(new Error(message));
      }, ms);
    });
  }
}
