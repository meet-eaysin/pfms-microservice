import { Injectable } from '@nestjs/common';
import { ILoanRepository } from '../../domain/interfaces/loan.repository.interface';
import { Loan } from '../../domain/entities/loan.entity';

@Injectable()
export class GetLoansByUserIdUseCase {
  constructor(private readonly repository: ILoanRepository) {}

  async execute(userId: string): Promise<Loan[]> {
    return this.repository.findLoansByUserId(userId);
  }
}
