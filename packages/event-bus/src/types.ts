export interface BaseEvent {
  eventId: string;
  eventType: string;
  timestamp: string;
  version: string;
  data: Record<string, unknown>;
  metadata?: {
    correlationId?: string;
    causationId?: string;
    userId?: string;
    [key: string]: unknown;
  };
}

export type EventHandler<T extends BaseEvent = BaseEvent> = (event: T) => Promise<void> | void;

export interface EventBusConfig {
  rabbitmq: {
    host: string;
    port: number;
    username: string;
    password: string;
    vhost?: string;
  };
  serviceName: string;
  prefetchCount?: number;
}
