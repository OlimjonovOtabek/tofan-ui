import { DomainError } from '@shared/models/errors/domain.error';

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('Username or password is incorrect.');
  }
}
