export enum SagaStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  COMPENSATING = 'compensating',
  COMPENSATED = 'compensated',
  FAILED = 'failed',
}

export interface SagaStep {
  name: string;
  execute: () => Promise<unknown>;
  compensate?: () => Promise<void>;
  timeout?: number; // milliseconds
}

export interface SagaState {
  sagaId: string;
  status: SagaStatus;
  currentStep: number;
  completedSteps: string[];
  failedStep?: string;
  error?: string;
  startedAt: string;
  completedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface SagaConfig {
  redis?: {
    host: string;
    port: number;
    password?: string;
  };
  defaultTimeout: number; // milliseconds
  statePrefix: string;
}
