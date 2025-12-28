import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { CreateSourceUseCase } from '../../../application/use-cases/income-source/create-source.use-case';
import { CreateIncomeSourceDto } from '../../../application/dto/income-source.dto';

@Controller('income/sources')
export class IncomeSourceController {
  constructor(private readonly createSourceUseCase: CreateSourceUseCase) {}

  @Post()
  async create(@Body() dto: CreateIncomeSourceDto, @Headers('authorization') authHeader: string) {
    const userId = this.extractUserId(authHeader);
    return this.createSourceUseCase.execute({ userId, ...dto });
  }

  private extractUserId(authHeader: string): string {
    if (!authHeader) throw new BadRequestException('Authorization header required');
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token)
      throw new BadRequestException('Invalid authorization header');
    return token;
  }
}
