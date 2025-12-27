import { Inject, Injectable } from '@nestjs/common';
import { IIncomeSourceRepository } from '../../../domain/repositories/income-source.repository';
import { IncomeSource, IncomeType, PaySchedule } from '../../../domain/models/income-source.model';

export interface CreateSourceCommand {
  userId: string;
  name: string;
  type: IncomeType;
  currency?: string;
  paySchedule?: PaySchedule;
}

@Injectable()
export class CreateSourceUseCase {
  constructor(
    @Inject('IIncomeSourceRepository')
    private readonly repository: IIncomeSourceRepository,
  ) {}

  async execute(command: CreateSourceCommand): Promise<IncomeSource> {
    return this.repository.create({
      userId: command.userId,
      name: command.name,
      type: command.type,
      currency: command.currency || 'USD',
      paySchedule: command.paySchedule || null,
    });
  }
}
