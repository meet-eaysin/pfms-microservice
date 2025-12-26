export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  [key: string]: unknown; // Allow additional claims
}
