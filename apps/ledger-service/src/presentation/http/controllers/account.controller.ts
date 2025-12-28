import { Controller, Get, Post, Body, Query, Headers, BadRequestException } from '@nestjs/common';
import { CreateAccountUseCase } from '../../../application/use-cases/account/create-account.use-case';
import { GetAccountsUseCase } from '../../../application/use-cases/account/get-accounts.use-case';
import { AccountType } from '@/domain/entities/account.model';
import { CreateAccountDto } from '@/application/dto';

@Controller('ledger/accounts')
export class AccountController {
  constructor(
    private readonly createAccountUseCase: CreateAccountUseCase,
    private readonly getAccountsUseCase: GetAccountsUseCase
  ) {}

  @Post()
  async create(@Body() dto: CreateAccountDto, @Headers('authorization') authHeader: string) {
    const userId = this.extractUserId(authHeader);
    return this.createAccountUseCase.execute({ userId, ...dto });
  }

  @Get()
  async findAll(@Headers('authorization') authHeader: string, @Query('type') type?: AccountType) {
    const userId = this.extractUserId(authHeader);
    return this.getAccountsUseCase.execute(userId, type);
  }

  private extractUserId(authHeader: string): string {
    if (!authHeader) throw new BadRequestException('Authorization header required');
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token)
      throw new BadRequestException('Invalid authorization header');
    return token;
  }
}
