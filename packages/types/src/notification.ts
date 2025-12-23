import { UUID, ISODateString, Decimal } from './common';

/**
 * Notification Service Types
 */
export interface Notification {
  id: UUID;
  userId: UUID;
  type: string;
  category: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: ('push' | 'email' | 'sms')[];
  isRead: boolean;
  readAt?: ISODateString;
  sentAt?: ISODateString;
  status: 'pending' | 'sent' | 'failed';
  errorMessage?: string;
  createdAt: ISODateString;
}

export interface NotificationTemplate {
  id: UUID;
  category: string;
  channel: 'push' | 'email' | 'sms';
  templateKey: string;
  subject?: string;
  bodyTemplate: string;
  variables?: Record<string, any>;
  createdAt: ISODateString;
}

export interface NotificationPreference {
  id: UUID;
  userId: UUID;
  channel: 'push' | 'email' | 'sms';
  category: string;
  enabled: boolean;
  createdAt: ISODateString;
}

/**
 * Notification DTOs
 */
export interface SendNotificationDto {
  userId: UUID;
  type: string;
  category: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  channels?: ('push' | 'email' | 'sms')[];
}

export interface CreateNotificationTemplateDto {
  category: string;
  channel: 'push' | 'email' | 'sms';
  templateKey: string;
  subject?: string;
  bodyTemplate: string;
  variables?: Record<string, any>;
}

export interface UpdateNotificationPreferenceDto {
  enabled?: boolean;
}

/**
 * Notification Events
 */
export interface NotificationEvent {
  userId: UUID;
  type: string;
  category: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  channels?: ('push' | 'email' | 'sms')[];
  createdAt: ISODateString;
}

export interface EmailNotification {
  to: string;
  subject: string;
  body: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    path: string;
  }>;
}

export interface SMSNotification {
  to: string;
  body: string;
  sendAt?: ISODateString;
}

export interface PushNotification {
  deviceToken: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  priority?: 'high' | 'normal';
}
