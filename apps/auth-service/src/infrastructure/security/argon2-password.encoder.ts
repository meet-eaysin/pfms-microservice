import { Injectable } from '@nestjs/common';
import { PasswordEncoder } from '../../domain/ports/repositories';
import * as argon2 from 'argon2';

@Injectable()
export class Argon2PasswordEncoder implements PasswordEncoder {
  async hash(password: string): Promise<string> {
    return argon2.hash(password);
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return argon2.verify(hashed, plain);
  }
}
