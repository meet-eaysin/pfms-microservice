import { Controller, Get, Post, Body, Query, Headers, BadRequestException } from '@nestjs/common';
import { PostEntryUseCase } from '../../application/use-cases/entry/post-entry.use-case';
import { GetEntriesUseCase } from '../../application/use-cases/entry/get-entries.use-case';
import { parseISO } from '@pfms/date';
import { PostJournalEntryDto } from '@/application/dto';

@Controller('ledger/entries')
export class EntryController {
  constructor(
    private readonly postEntryUseCase: PostEntryUseCase,
    private readonly getEntriesUseCase: GetEntriesUseCase
  ) {}

  @Post()
  async post(@Body() dto: PostJournalEntryDto, @Headers('authorization') authHeader: string) {
    const userId = this.extractUserId(authHeader);
    return this.postEntryUseCase.execute({ userId, ...dto });
  }

  @Get()
  async findAll(
    @Headers('authorization') authHeader: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const userId = this.extractUserId(authHeader);
    const filters = {
      ...(startDate && { startDate: parseISO(startDate) }),
      ...(endDate && { endDate: parseISO(endDate) }),
    };
    return this.getEntriesUseCase.execute(userId, filters);
  }

  private extractUserId(authHeader: string): string {
    if (!authHeader) throw new BadRequestException('Authorization header required');
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token)
      throw new BadRequestException('Invalid authorization header');
    return token;
  }
}
