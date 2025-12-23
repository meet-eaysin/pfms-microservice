import { Router, Request, Response, NextFunction } from 'express';
import { UUID, CreateExpenseDto } from '@pfms/types';
import { ValidationError, NotFoundError, HttpStatus, ResponseUtil } from '@pfms/utils';
import { ExpenseService } from './expense.service';

export class ExpenseController {
  private router: Router;

  constructor(private expenseService: ExpenseService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // List expenses with pagination
    this.router.get('/', this.listExpenses.bind(this));

    // Get single expense
    this.router.get('/:id', this.getExpense.bind(this));

    // Create expense
    this.router.post('/', this.createExpense.bind(this));

    // Update expense
    this.router.put('/:id', this.updateExpense.bind(this));

    // Delete expense
    this.router.delete('/:id', this.deleteExpense.bind(this));
  }

  private async listExpenses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'user-anonymous';
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));

      const result = await this.expenseService.listExpenses(userId as UUID, page, limit);

      res
        .status(HttpStatus.OK)
        .json(
          ResponseUtil.paginated(
            result.expenses,
            result.pagination.page,
            result.pagination.limit,
            result.pagination.total
          )
        );
    } catch (error) {
      next(error);
    }
  }

  private async getExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'user-anonymous';
      const { id } = req.params;

      const expense = await this.expenseService.getExpense(id as UUID, userId as UUID);

      if (!expense) {
        throw new NotFoundError('Expense', id);
      }

      res.status(HttpStatus.OK).json(ResponseUtil.success(expense));
    } catch (error) {
      next(error);
    }
  }

  private async createExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'user-anonymous';
      const expenseData: CreateExpenseDto = req.body;

      if (!expenseData.amount || Number(expenseData.amount) <= 0) {
        throw new ValidationError('Amount must be greater than 0');
      }

      const expense = await this.expenseService.createExpense(userId as UUID, expenseData);

      res.status(HttpStatus.CREATED).json(ResponseUtil.success(expense));
    } catch (error) {
      next(error);
    }
  }

  private async updateExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'user-anonymous';
      const { id } = req.params;
      const updateData = req.body;

      const expense = await this.expenseService.updateExpense(
        id as UUID,
        userId as UUID,
        updateData
      );

      if (!expense) {
        throw new NotFoundError('Expense', id);
      }

      res.status(HttpStatus.OK).json(ResponseUtil.success(expense));
    } catch (error) {
      next(error);
    }
  }

  private async deleteExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'user-anonymous';
      const { id } = req.params;

      const success = await this.expenseService.deleteExpense(id as UUID, userId as UUID);

      if (!success) {
        throw new NotFoundError('Expense', id);
      }

      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
