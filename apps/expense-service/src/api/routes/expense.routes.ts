import { Router, Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { PrismaExpenseRepository } from '../../domain/repositories/expense.repository.impl';
import { CreateExpenseCommand } from '../../commands/create-expense/create-expense.command';
import { CreateExpenseHandler } from '../../commands/create-expense/create-expense.handler';
import { UpdateExpenseCommand } from '../../commands/update-expense/update-expense.command';
import { UpdateExpenseHandler } from '../../commands/update-expense/update-expense.handler';
import { DeleteExpenseCommand } from '../../commands/delete-expense/delete-expense.command';
import { DeleteExpenseHandler } from '../../commands/delete-expense/delete-expense.handler';
import { GetExpenseQuery } from '../../queries/get-expense/get-expense.query';
import { GetExpenseHandler } from '../../queries/get-expense/get-expense.handler';
import { ListExpensesQuery } from '../../queries/list-expenses/list-expenses.query';
import { ListExpensesHandler } from '../../queries/list-expenses/list-expenses.handler';
import { GetExpenseStatsQuery } from '../../queries/get-expense-stats/get-expense-stats.query';
import { GetExpenseStatsHandler } from '../../queries/get-expense-stats/get-expense-stats.handler';

const router = Router();
const repository = new PrismaExpenseRepository();

// Command handlers
const createHandler = new CreateExpenseHandler(repository);
const updateHandler = new UpdateExpenseHandler(repository);
const deleteHandler = new DeleteExpenseHandler(repository);

// Query handlers
const getHandler = new GetExpenseHandler(repository);
const listHandler = new ListExpensesHandler(repository);
const statsHandler = new GetExpenseStatsHandler(repository);

/**
 * POST /api/v2/expenses - Create expense
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const command = plainToClass(CreateExpenseCommand, {
      ...req.body,
      userId: req.headers['x-user-id'] || req.body.userId, // From auth middleware
    });

    const errors = await validate(command);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const expense = await createHandler.execute(command);
    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v2/expenses - List expenses
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = plainToClass(ListExpensesQuery, {
      userId: req.headers['x-user-id'],
      categoryId: req.query.categoryId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      tags: req.query.tags ? String(req.query.tags).split(',') : undefined,
      limit: req.query.limit ? parseInt(String(req.query.limit)) : undefined,
      offset: req.query.offset ? parseInt(String(req.query.offset)) : undefined,
    });

    const errors = await validate(query);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const result = await listHandler.execute(query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v2/expenses/stats - Get expense statistics
 */
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = plainToClass(GetExpenseStatsQuery, {
      userId: req.headers['x-user-id'],
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      categoryId: req.query.categoryId,
    });

    const errors = await validate(query);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const stats = await statsHandler.execute(query);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v2/expenses/:id - Get single expense
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = plainToClass(GetExpenseQuery, {
      id: req.params.id,
      userId: req.headers['x-user-id'],
    });

    const errors = await validate(query);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const expense = await getHandler.execute(query);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v2/expenses/:id - Update expense
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const command = plainToClass(UpdateExpenseCommand, {
      id: req.params.id,
      userId: req.headers['x-user-id'],
      ...req.body,
    });

    const errors = await validate(command);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const expense = await updateHandler.execute(command);
    res.json(expense);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v2/expenses/:id - Delete expense
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const command = plainToClass(DeleteExpenseCommand, {
      id: req.params.id,
      userId: req.headers['x-user-id'],
    });

    const errors = await validate(command);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    await deleteHandler.execute(command);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
