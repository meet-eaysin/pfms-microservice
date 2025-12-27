export const AUTH_CONSTANTS = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  DEFAULT_SESSION_TIMEOUT_HOURS: 24,
  DEFAULT_IDLE_TIMEOUT_HOURS: 2,
  COOKIE_MAX_AGE_DAYS: 30,
  BCRYPT_ROUNDS: 10,
  TOKEN_EXPIRY_MINUTES: 15,
  REFRESH_TOKEN_EXPIRY_DAYS: 7,
} as const;

export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  SESSION_EXPIRED: 'Session has expired',
  UNAUTHORIZED: 'Authentication required',
  EMAIL_NOT_VERIFIED: 'Email not verified',
  USER_NOT_FOUND: 'User not found',
  SESSION_NOT_FOUND: 'Session not found',
  INVALID_TOKEN: 'Invalid or expired token',
  WEAK_PASSWORD: 'Password must be at least 8 characters long',
  EMAIL_ALREADY_EXISTS: 'Email already registered',
} as const;

export const SUCCESS_MESSAGES = {
  USER_CREATED: 'User registered successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logged out successfully',
  PASSWORD_RESET: 'Password reset successful',
  EMAIL_VERIFIED: 'Email verified successfully',
  SESSION_REVOKED: 'Session revoked successfully',
} as const;
