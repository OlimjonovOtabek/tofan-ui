import { DomainError } from '@domain/shared/errors/domain.error';

/** The session is gone: no tokens, or the backend rejected the ones we hold. */
export class SessionExpiredError extends DomainError {
  constructor(message = 'The session has expired.') {
    super(message);
  }
}
