import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { LogHabitDto } from './dto/log-habit.dto';

@Controller('habits')
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  private getUserId(req: any): string {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }
    return 'default-user-id';
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateHabitDto) {
    const userId = this.getUserId(req);
    return this.habitsService.create(userId, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    const userId = this.getUserId(req);
    return this.habitsService.findAll(userId);
  }

  @Post(':id/log')
  log(@Req() req: any, @Param('id') id: string, @Body() dto: LogHabitDto) {
    const userId = this.getUserId(req);
    return this.habitsService.log(userId, id, dto);
  }
}
