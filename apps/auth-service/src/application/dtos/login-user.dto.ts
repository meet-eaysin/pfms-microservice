export class LoginUserDto {
  email!: string;
  password!: string;
}

export class LoginUserResponseDto {
  user!: {
    id: string;
    email: string;
    role: string;
  };
  accessToken!: string;
  refreshToken!: string;
}
