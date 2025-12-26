export interface UserCreatedEvent {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  occurredAt: Date;
}

export abstract class EventPublisher {
  abstract publishUserCreated(event: UserCreatedEvent): Promise<void>;
}
