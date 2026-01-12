import { IsNotEmpty, IsUUID, IsEnum, IsOptional, IsString } from 'class-validator';
import { MemberRole } from '../../../domain/entities/group.entity';

export class AddMemberDto {
  @IsNotEmpty()
  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsEnum(MemberRole)
  role?: MemberRole = MemberRole.MEMBER;

  @IsOptional()
  @IsString()
  displayName?: string;
}
