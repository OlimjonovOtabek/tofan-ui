import { DomainError } from './domain.error';

/** The signed-in user lacks the rights this operation requires. */
export class AccessDeniedError extends DomainError {
  constructor(message = 'Access to this operation is denied.') {
    super(message);
  }
}
