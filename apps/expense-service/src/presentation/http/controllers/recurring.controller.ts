import { Controller, Get, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { CreateRecurringUseCase } from '../../../application/use-cases/recurring/create-recurring.use-case';
import { CreateRecurringDto } from '../../../application/dto/recurring/recurring.dto';

@Controller('recurring')
export class RecurringController {
  constructor(
    private readonly createRecurringUseCase: CreateRecurringUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateRecurringDto, @Headers('authorization') authHeader: string) {
    const userId = this.extractUserId(authHeader);
    return this.createRecurringUseCase.execute({ userId, ...dto });
  }

  private extractUserId(authHeader: string): string {
    if (!authHeader) throw new BadRequestException('Authorization header required');
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) throw new BadRequestException('Invalid authorization header');
    return token;
  }
}
