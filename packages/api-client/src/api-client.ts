import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { createLogger } from '@pfms/utils';
import { ApiClientConfig, ApiResponse, ApiError } from './types';
import { CircuitBreaker } from './circuit-breaker';

const logger = createLogger('ApiClient');

export class ApiClient {
  private client: AxiosInstance;
  private circuitBreaker?: CircuitBreaker;

  constructor(private config: ApiClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Setup circuit breaker if enabled
    if (config.circuitBreaker?.enabled) {
      this.circuitBreaker = new CircuitBreaker(config.circuitBreaker);
    }

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        logger.debug('API Request', {
          method: config.method,
          url: config.url,
        });
        return config;
      },
      (error) => {
        logger.error('Request error', { error });
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('API Response', {
          status: response.status,
          url: response.config.url,
        });
        return response;
      },
      (error) => {
        logger.error('Response error', {
          status: error.response?.status,
          message: error.message,
        });
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.executeWithRetry(() => this.client.get<T>(url, config));
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.executeWithRetry(() => this.client.post<T>(url, data, config));
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.executeWithRetry(() => this.client.put<T>(url, data, config));
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.executeWithRetry(() => this.client.delete<T>(url, config));
  }

  /**
   * Execute request with retry logic
   */
  private async executeWithRetry<T>(fn: () => Promise<AxiosResponse<T>>): Promise<ApiResponse<T>> {
    const maxRetries = this.config.retries || 3;
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Check circuit breaker
        if (this.circuitBreaker && !this.circuitBreaker.canExecute()) {
          throw new Error('Circuit breaker is open');
        }

        const response = await fn();

        // Record success
        if (this.circuitBreaker) {
          this.circuitBreaker.recordSuccess();
        }

        return {
          data: response.data,
          status: response.status,
          headers: response.headers as Record<string, string>,
        };
      } catch (error) {
        lastError = error as Error;

        // Record failure
        if (this.circuitBreaker) {
          this.circuitBreaker.recordFailure();
        }

        // Don't retry on client errors (4xx)
        if (axios.isAxiosError(error) && error.response?.status && error.response.status < 500) {
          break;
        }

        // Wait before retry
        if (attempt < maxRetries - 1) {
          await this.sleep(Math.pow(2, attempt) * 1000);
        }
      }
    }

    throw lastError;
  }

  /**
   * Handle API errors
   */
  private handleError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      return {
        message: error.response?.data?.message || error.message,
        status: error.response?.status || 500,
        code: error.code,
        details: error.response?.data,
      };
    }

    return {
      message: 'Unknown error occurred',
      status: 500,
    };
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
