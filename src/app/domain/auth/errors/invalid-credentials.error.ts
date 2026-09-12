import { DomainError } from '@domain/shared/errors/domain.error';

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('Username or password is incorrect.');
  }
}
