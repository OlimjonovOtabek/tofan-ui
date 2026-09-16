import { DomainError } from './domain.error';

/** A rule of the backend domain rejected the request; `code` identifies which one. */
export class BusinessRuleError extends DomainError {
  constructor(message: string, code = '') {
    super(message, code);
  }
}
