import { Controller, Get, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { CreateHabitUseCase } from '../../../application/use-cases/habit/create-habit.use-case';
import { LogHabitUseCase } from '../../../application/use-cases/habit/log-habit.use-case';
import { CreateHabitDto, LogHabitDto } from '../../../application/dto/habit/habit.dto';

@Controller('habits')
export class HabitController {
  constructor(
    private readonly createHabitUseCase: CreateHabitUseCase,
    private readonly logHabitUseCase: LogHabitUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateHabitDto, @Headers('authorization') authHeader: string) {
    const userId = this.extractUserId(authHeader);
    return this.createHabitUseCase.execute({ userId, ...dto });
  }

  @Post('log')
  async log(@Body() dto: LogHabitDto) {
    return this.logHabitUseCase.execute(dto);
  }

  private extractUserId(authHeader: string): string {
    if (!authHeader) throw new BadRequestException('Authorization header required');
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) throw new BadRequestException('Invalid authorization header');
    return token;
  }
}
