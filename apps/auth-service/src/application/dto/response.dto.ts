export class UserResponseDto {
  id!: string;
  email!: string;
  emailVerified!: boolean;
  name!: string | null;
  image!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}

export class SessionResponseDto {
  id!: string;
  userId!: string;
  expiresAt!: Date;
  ipAddress!: string | null;
  userAgent!: string | null;
  createdAt!: Date;
}

export class AuthResponseDto {
  user!: UserResponseDto;
  session!: SessionResponseDto;
}
