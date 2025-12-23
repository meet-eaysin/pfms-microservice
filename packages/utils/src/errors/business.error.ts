import { AppError } from './app-error';

export class BusinessError extends AppError {
  constructor(message: string, code: string = 'BUSINESS_ERROR') {
    super(message, 400, true, code);
  }
}
