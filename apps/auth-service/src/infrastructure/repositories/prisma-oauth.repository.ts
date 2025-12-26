import { Injectable } from '@nestjs/common';
import { OAuthAccountRepository } from '../../domain/ports/repositories';
import { OAuthAccount } from '../../domain/entities/user.entity';
import { PrismaService } from '../config/prisma.service';

@Injectable()
export class PrismaOAuthAccountRepository implements OAuthAccountRepository {
  constructor(private prisma: PrismaService) {}

  async findByProvider(
    providerId: string,
    providerUserId: string,
  ): Promise<OAuthAccount | null> {
    const account = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_id_provider_user_id: {
          provider_id: providerId,
          provider_user_id: providerUserId,
        },
      },
    });
    if (!account) return null;
    return new OAuthAccount(
      account.provider_id,
      account.provider_user_id,
      account.user_id,
    );
  }

  async create(account: OAuthAccount): Promise<OAuthAccount> {
    const created = await this.prisma.oAuthAccount.create({
      data: {
        provider_id: account.providerId,
        provider_user_id: account.providerUserId,
        user_id: account.userId,
      },
    });
    return new OAuthAccount(
      created.provider_id,
      created.provider_user_id,
      created.user_id,
    );
  }
}
