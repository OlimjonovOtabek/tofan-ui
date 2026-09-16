import { DomainError } from './domain.error';

/** One rejected field or rule, as reported by the backend validator. */
export interface ValidationIssue {
  readonly code: string;
  readonly message: string;
}

export class ValidationError extends DomainError {
  constructor(
    message: string,
    readonly issues: readonly ValidationIssue[] = [],
    code = '',
  ) {
    super(message, code);
  }
}
