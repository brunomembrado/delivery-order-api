import { BaseError, ErrorDetails } from './base.error';

export class ValidationError extends BaseError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, 400, true, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends BaseError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, 404, true, { resource, identifier });
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends BaseError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, 409, true, details);
    this.name = 'ConflictError';
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401, true);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends BaseError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403, true);
    this.name = 'ForbiddenError';
  }
}

export class InvalidStateTransitionError extends BaseError {
  constructor(currentState: string, targetState: string, entityType: string = 'Entity') {
    super(
      `Invalid state transition for ${entityType}: cannot transition from '${currentState}' to '${targetState}'`,
      400,
      true,
      { currentState, targetState, entityType }
    );
    this.name = 'InvalidStateTransitionError';
  }
}

export class BusinessRuleViolationError extends BaseError {
  constructor(rule: string, details?: ErrorDetails) {
    super(`Business rule violation: ${rule}`, 422, true, details);
    this.name = 'BusinessRuleViolationError';
  }
}

export class InternalServerError extends BaseError {
  constructor(message: string = 'Internal server error', details?: ErrorDetails) {
    super(message, 500, false, details);
    this.name = 'InternalServerError';
  }
}
