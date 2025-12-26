export interface UserCreatedEvent {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  occurredAt: Date;
}

export interface UserForgotPasswordEvent {
  email: string;
  token: string;
}

export interface UserPasswordChangedEvent {
  userId: string;
  occurredAt: Date;
}

export abstract class EventPublisher {
  abstract publishUserCreated(event: UserCreatedEvent): Promise<void>;
  abstract publishForgotPassword(event: UserForgotPasswordEvent): Promise<void>;
  abstract publishPasswordChanged(
    event: UserPasswordChangedEvent,
  ): Promise<void>;
}
