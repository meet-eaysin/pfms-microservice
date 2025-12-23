import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  register,
  Counter,
  Histogram,
  Gauge,
  collectDefaultMetrics,
} from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  // HTTP Metrics
  public readonly httpRequestsTotal: Counter<string>;
  public readonly httpRequestDuration: Histogram<string>;

  // Auth Metrics
  public readonly authAttemptsTotal: Counter<string>;
  public readonly authSuccessTotal: Counter<string>;
  public readonly authFailureTotal: Counter<string>;
  public readonly mfaEnabledTotal: Gauge<string>;
  public readonly activeSessionsGauge: Gauge<string>;

  // User Metrics
  public readonly userRegistrationsTotal: Counter<string>;
  public readonly activeUsersGauge: Gauge<string>;

  constructor() {
    // Clear existing metrics
    register.clear();

    // Collect default metrics (CPU, memory, etc.)
    collectDefaultMetrics({ register, prefix: 'auth_service_' });

    // HTTP Request Counter
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'path', 'status_code', 'service'],
      registers: [register],
    });

    // HTTP Request Duration
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_ms',
      help: 'Duration of HTTP requests in milliseconds',
      labelNames: ['method', 'path', 'status_code', 'service'],
      buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
      registers: [register],
    });

    // Authentication Attempts
    this.authAttemptsTotal = new Counter({
      name: 'auth_attempts_total',
      help: 'Total number of authentication attempts',
      labelNames: ['method', 'service'], // method: email, oauth, mfa
      registers: [register],
    });

    // Authentication Success
    this.authSuccessTotal = new Counter({
      name: 'auth_success_total',
      help: 'Total number of successful authentications',
      labelNames: ['method', 'service'],
      registers: [register],
    });

    // Authentication Failures
    this.authFailureTotal = new Counter({
      name: 'auth_failure_total',
      help: 'Total number of failed authentications',
      labelNames: ['method', 'reason', 'service'], // reason: invalid_credentials, account_locked, etc.
      registers: [register],
    });

    // MFA Enabled Users
    this.mfaEnabledTotal = new Gauge({
      name: 'mfa_enabled_users_total',
      help: 'Total number of users with MFA enabled',
      labelNames: ['service'],
      registers: [register],
    });

    // Active Sessions
    this.activeSessionsGauge = new Gauge({
      name: 'active_sessions_total',
      help: 'Total number of active user sessions',
      labelNames: ['service'],
      registers: [register],
    });

    // User Registrations
    this.userRegistrationsTotal = new Counter({
      name: 'user_registrations_total',
      help: 'Total number of user registrations',
      labelNames: ['service'],
      registers: [register],
    });

    // Active Users
    this.activeUsersGauge = new Gauge({
      name: 'active_users_total',
      help: 'Total number of active users',
      labelNames: ['service'],
      registers: [register],
    });
  }

  onModuleInit() {
    // Initialize gauges with default values
    this.mfaEnabledTotal.set({ service: 'auth' }, 0);
    this.activeSessionsGauge.set({ service: 'auth' }, 0);
    this.activeUsersGauge.set({ service: 'auth' }, 0);
  }

  /**
   * Get all metrics in Prometheus format
   */
  async getMetrics(): Promise<string> {
    return register.metrics();
  }

  /**
   * Get metrics content type
   */
  getContentType(): string {
    return register.contentType;
  }

  /**
   * Record HTTP request
   */
  recordHttpRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
  ) {
    this.httpRequestsTotal.inc({
      method,
      path,
      status_code: statusCode.toString(),
      service: 'auth',
    });

    this.httpRequestDuration.observe(
      {
        method,
        path,
        status_code: statusCode.toString(),
        service: 'auth',
      },
      duration,
    );
  }

  /**
   * Record authentication attempt
   */
  recordAuthAttempt(method: 'email' | 'oauth' | 'mfa') {
    this.authAttemptsTotal.inc({ method, service: 'auth' });
  }

  /**
   * Record successful authentication
   */
  recordAuthSuccess(method: 'email' | 'oauth' | 'mfa') {
    this.authSuccessTotal.inc({ method, service: 'auth' });
  }

  /**
   * Record failed authentication
   */
  recordAuthFailure(method: 'email' | 'oauth' | 'mfa', reason: string) {
    this.authFailureTotal.inc({ method, reason, service: 'auth' });
  }

  /**
   * Record user registration
   */
  recordUserRegistration() {
    this.userRegistrationsTotal.inc({ service: 'auth' });
  }

  /**
   * Update MFA enabled users count
   */
  updateMfaEnabledCount(count: number) {
    this.mfaEnabledTotal.set({ service: 'auth' }, count);
  }

  /**
   * Update active sessions count
   */
  updateActiveSessionsCount(count: number) {
    this.activeSessionsGauge.set({ service: 'auth' }, count);
  }

  /**
   * Update active users count
   */
  updateActiveUsersCount(count: number) {
    this.activeUsersGauge.set({ service: 'auth' }, count);
  }
}
