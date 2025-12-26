export interface MfaSecret {
  secret: string;
  otpauthUrl: string;
}

export abstract class MfaService {
  abstract generateSecret(email: string): Promise<MfaSecret>;
  abstract generateQrCode(otpauthUrl: string): Promise<string>;
  abstract verify(token: string, secret: string): Promise<boolean>;
}
