import { DomainError } from './domain.error';

export class AccessDeniedError extends DomainError {
  constructor(message = 'Access to this operation is denied.') {
    super(message);
  }
}
