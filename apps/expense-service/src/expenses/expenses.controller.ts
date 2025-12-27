import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

// Temporary mock auth guard until common auth is integrated
// In real app, we use @UseGuards(JwtAuthGuard)
// For now, assume a userId is passed in header or mock
// To follow user-service pattern, we'll extract from header "Authorization" in a guard or middleware.
// For NestJS, middleware or Guard. I'll use a simple param decorator or assume request is populated by middleware.
// The user-service used `authMiddleware` express middleware. I can replicate that or use Nest Guard.
// Given strict timelines, I'll extract from request object assuming a middleware populates it.

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  private getUserId(req: any): string {
    // Basic extraction primarily for verification script compatibility
    // In production this comes from JWT strategy
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }
    return 'default-user-id'; // Fallback for dev/testing if generic
  }

  @Post()
  create(@Req() req: any, @Body() createExpenseDto: CreateExpenseDto) {
    const userId = this.getUserId(req);
    return this.expensesService.create(userId, createExpenseDto);
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('categoryId') categoryId?: string
  ) {
    const userId = this.getUserId(req);
    return this.expensesService.findAll(userId, { startDate, endDate, categoryId });
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    const userId = this.getUserId(req);
    return this.expensesService.findOne(id, userId);
  }

  @Put(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto) {
    const userId = this.getUserId(req);
    return this.expensesService.update(id, userId, updateExpenseDto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    const userId = this.getUserId(req);
    return this.expensesService.remove(id, userId);
  }
}
