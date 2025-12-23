import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const startTime = Date.now();
    const { method, url } = request;

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          // Normalize path (remove IDs and query params)
          const normalizedPath = this.normalizePath(url);

          this.metricsService.recordHttpRequest(
            method,
            normalizedPath,
            statusCode,
            duration,
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;
          const normalizedPath = this.normalizePath(url);

          this.metricsService.recordHttpRequest(
            method,
            normalizedPath,
            statusCode,
            duration,
          );
        },
      }),
    );
  }

  /**
   * Normalize URL path by removing IDs and query parameters
   * Example: /api/v1/users/123 -> /api/v1/users/:id
   */
  private normalizePath(url: string): string {
    // Remove query parameters
    const pathWithoutQuery = url.split('?')[0];

    // Replace UUIDs and numeric IDs with :id
    return pathWithoutQuery
      .replace(
        /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
        '/:id',
      )
      .replace(/\/\d+/g, '/:id');
  }
}
