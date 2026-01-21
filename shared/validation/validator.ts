import { z, ZodError, ZodSchema } from 'zod';

import { ValidationError } from '../errors';

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
}

export function validate<T>(schema: ZodSchema<T>, data: unknown): ValidationResult<T> {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors: Record<string, string[]> = {};

      error.errors.forEach(err => {
        const path = err.path.join('.');
        if (!formattedErrors[path]) {
          formattedErrors[path] = [];
        }
        formattedErrors[path].push(err.message);
      });

      return { success: false, errors: formattedErrors };
    }
    throw error;
  }
}

export function validateOrThrow<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = validate(schema, data);

  if (!result.success) {
    throw new ValidationError('Validation failed', { errors: result.errors });
  }

  return result.data!;
}

export function createValidator<T>(schema: ZodSchema<T>) {
  return {
    validate: (data: unknown) => validate(schema, data),
    validateOrThrow: (data: unknown) => validateOrThrow(schema, data),
    schema,
  };
}

export { z, ZodError, ZodSchema };
