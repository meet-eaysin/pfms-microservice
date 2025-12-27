import type { IUserRepository } from '../../../domain/interfaces/repository.interface';
import type { IFamilyMember } from '../../../domain/entities/user.entity';
import type { EventPublisher } from '../../../infrastructure/messaging/event.publisher';

interface IInviteFamilyMemberOptions {
  headUserId: string;
  memberEmail: string;
  memberUserId: string;
  relationship: string;
}

export class InviteFamilyMemberUseCase {
  constructor(
    private readonly repository: IUserRepository,
    private readonly eventPublisher: EventPublisher
  ) {}

  async execute(options: IInviteFamilyMemberOptions): Promise<IFamilyMember> {
    const member = await this.repository.createFamilyMember({
      headUserId: options.headUserId,
      memberUserId: options.memberUserId,
      relationship: options.relationship,
      inviteStatus: 'PENDING',
    });

    // Publish event for notification service
    await this.eventPublisher.publishFamilyInvited({
      headUserId: options.headUserId,
      memberEmail: options.memberEmail,
      relationship: options.relationship,
    });

    return member;
  }
}
