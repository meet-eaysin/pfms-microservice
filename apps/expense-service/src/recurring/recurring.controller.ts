import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { RecurringService } from './recurring.service';
import { CreateRecurringExpenseDto } from './dto/create-recurring.dto';

@Controller('expenses/recurring')
export class RecurringController {
  constructor(private readonly recurringService: RecurringService) {}

  private getUserId(req: any): string {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }
    return 'default-user-id';
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateRecurringExpenseDto) {
    const userId = this.getUserId(req);
    return this.recurringService.create(userId, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    const userId = this.getUserId(req);
    return this.recurringService.findAll(userId);
  }
}
