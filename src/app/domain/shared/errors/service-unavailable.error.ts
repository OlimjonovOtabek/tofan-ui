import { DomainError } from './domain.error';

/** The backend could not be reached or failed unexpectedly (network error, 5xx). */
export class ServiceUnavailableError extends DomainError {
  constructor(message = 'The service is unavailable.') {
    super(message);
  }
}
