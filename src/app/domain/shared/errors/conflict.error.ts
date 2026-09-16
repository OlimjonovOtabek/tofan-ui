import { DomainError } from './domain.error';

/** The request clashes with the current state, e.g. a duplicate name. */
export class ConflictError extends DomainError {
  constructor(message: string, code = '') {
    super(message, code);
  }
}
