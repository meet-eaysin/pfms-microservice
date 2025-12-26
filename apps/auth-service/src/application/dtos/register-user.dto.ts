export class RegisterUserDto {
  email!: string;
  password!: string;
  firstName!: string;
  lastName!: string;
}

export class RegisterUserResponseDto {
  user!: {
    id: string;
    email: string;
  };
  accessToken!: string;
  refreshToken!: string;
}
