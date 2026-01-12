import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateLoanUseCase } from '../../application/use-cases/create-loan.use-case';
import { CreateContactUseCase } from '../../application/use-cases/create-contact.use-case';
import { RecordPaymentUseCase } from '../../application/use-cases/record-payment.use-case';
import { GetLoansByUserIdUseCase } from '../../application/use-cases/get-loans-by-user.use-case';
import { CreateLoanDto } from '../../application/dto/loan/create-loan.dto';
import { CreateContactDto } from '../../application/dto/loan/create-contact.dto';
import { RecordLoanPaymentDto } from '../../application/dto/loan/record-payment.dto';

@ApiTags('Loans')
@Controller()
export class LoanController {
  constructor(
    private readonly createLoanUseCase: CreateLoanUseCase,
    private readonly createContactUseCase: CreateContactUseCase,
    private readonly recordPaymentUseCase: RecordPaymentUseCase,
    private readonly getLoansUseCase: GetLoansByUserIdUseCase
  ) {}

  @Post('contacts')
  @ApiOperation({ summary: 'Create a new contact' })
  async createContact(@Body() dto: CreateContactDto) {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    return this.createContactUseCase.execute({ ...dto, userId });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new loan' })
  async createLoan(@Body() dto: CreateLoanDto) {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    return this.createLoanUseCase.execute({ ...dto, userId });
  }

  @Get()
  @ApiOperation({ summary: 'Get all user loans' })
  async getLoans() {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    return this.getLoansUseCase.execute(userId);
  }

  @Post('payments')
  @ApiOperation({ summary: 'Record a loan payment' })
  async recordPayment(@Body() dto: RecordLoanPaymentDto) {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    return this.recordPaymentUseCase.execute(userId, dto);
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  health() {
    return { status: 'ok', service: 'loan-service' };
  }
}
