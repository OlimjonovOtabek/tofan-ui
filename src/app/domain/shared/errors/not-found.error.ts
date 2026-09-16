import { DomainError } from './domain.error';

/** The requested record does not exist (or is no longer visible to this user). */
export class NotFoundError extends DomainError {
  constructor(message: string, code = '') {
    super(message, code);
  }
}
