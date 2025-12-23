import 'reflect-metadata';

const SUBSCRIBE_METADATA = Symbol('subscribe');

/**
 * Decorator to mark a method as an event subscriber
 */
export function Subscribe(eventType: string) {
  return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
    const existingSubscriptions = Reflect.getMetadata(SUBSCRIBE_METADATA, target.constructor) || [];

    Reflect.defineMetadata(
      SUBSCRIBE_METADATA,
      [...existingSubscriptions, { eventType, method: propertyKey }],
      target.constructor
    );

    return descriptor;
  };
}

/**
 * Get all subscriptions for a class
 */
export function getSubscriptions(target: object): Array<{
  eventType: string;
  method: string;
}> {
  return Reflect.getMetadata(SUBSCRIBE_METADATA, target) || [];
}
