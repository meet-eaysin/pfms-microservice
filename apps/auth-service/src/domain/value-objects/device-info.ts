export interface DeviceInfo {
  userAgent?: string;
  ip?: string;
  deviceId?: string;
  [key: string]: string | undefined; // Allow extensibility for other device props
}
