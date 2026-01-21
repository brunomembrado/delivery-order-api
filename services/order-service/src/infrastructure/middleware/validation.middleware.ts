import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

type ValidationTarget = 'body' | 'params' | 'query';

export const validateRequest = (schema: ZodSchema, target: ValidationTarget = 'body') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const data = req[target];
      const validatedData = schema.parse(data);

      // Replace the original data with validated (and potentially transformed) data
      req[target] = validatedData;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateBody = (schema: ZodSchema) => validateRequest(schema, 'body');
export const validateParams = (schema: ZodSchema) => validateRequest(schema, 'params');
export const validateQuery = (schema: ZodSchema) => validateRequest(schema, 'query');
