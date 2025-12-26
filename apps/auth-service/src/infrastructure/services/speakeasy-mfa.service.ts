import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { MfaService, MfaSecret } from '../../domain/ports/mfa.service';

@Injectable()
export class SpeakeasyMfaService implements MfaService {
  async generateSecret(email: string): Promise<MfaSecret> {
    const secret = speakeasy.generateSecret({
      name: `PFMS (${email})`,
      issuer: 'PFMS', // Could use configService.mfaIssuer if added to config
      length: 20,
    });

    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url || '',
    };
  }

  async generateQrCode(otpauthUrl: string): Promise<string> {
    return QRCode.toDataURL(otpauthUrl);
  }

  async verify(token: string, secret: string): Promise<boolean> {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 1, // Allow 30s leeway
    });
  }
}
