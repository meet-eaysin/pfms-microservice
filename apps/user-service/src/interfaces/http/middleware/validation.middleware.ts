import type { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

type ClassType<T> = new () => T;

export function validateBody<T extends object>(dtoClass: ClassType<T>) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const dtoInstance = plainToInstance(dtoClass, req.body);
    const errors = await validate(dtoInstance);

    if (errors.length > 0) {
      const messages = errors.map((error) => {
        const constraints = error.constraints ?? {};
        return Object.values(constraints).join(', ');
      });

      res.status(400).json({
        statusCode: 400,
        message: 'Validation failed',
        errors: messages,
      });
      return;
    }

    req.body = dtoInstance;
    next();
  };
}
