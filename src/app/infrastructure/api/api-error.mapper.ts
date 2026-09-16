import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { SessionExpiredError } from '@domain/auth/errors/session-expired.error';
import { AccessDeniedError } from '@domain/shared/errors/access-denied.error';
import { BusinessRuleError } from '@domain/shared/errors/business-rule.error';
import { ConflictError } from '@domain/shared/errors/conflict.error';
import { DomainError } from '@domain/shared/errors/domain.error';
import { NotFoundError } from '@domain/shared/errors/not-found.error';
import { ServiceUnavailableError } from '@domain/shared/errors/service-unavailable.error';
import { ValidationError, ValidationIssue } from '@domain/shared/errors/validation.error';
import type { ApiError } from './generated/models/api-error';
import { ErrorType } from './generated/models/error-type';

/**
 * The backend answers failures with RFC 7807 problem details built from its `Error` type:
 * `title` carries the error code, `detail` the message and `errors` the validation issues.
 */
interface ProblemDetails {
  title?: string;
  detail?: string;
  errors?: ApiError[];
}

/** Translates anything thrown by the HTTP layer into a domain error. */
export function toDomainError(error: unknown): DomainError {
  if (error instanceof DomainError) {
    return error;
  }
  if (!(error instanceof HttpErrorResponse)) {
    return new ServiceUnavailableError();
  }

  const problem = toProblemDetails(error.error);
  const code = problem.title ?? '';
  const message = problem.detail ?? error.message;

  switch (error.status) {
    case HttpStatusCode.BadRequest:
      return problem.errors === undefined
        ? new BusinessRuleError(message, code)
        : new ValidationError(message, toIssues(problem.errors), code);
    case HttpStatusCode.Unauthorized:
      return new SessionExpiredError();
    case HttpStatusCode.Forbidden:
      return new AccessDeniedError();
    case HttpStatusCode.NotFound:
      return new NotFoundError(message, code);
    case HttpStatusCode.Conflict:
      return new ConflictError(message, code);
    default:
      return new ServiceUnavailableError(message);
  }
}

/** Translates a failed `Result` envelope returned with a 200 status into a domain error. */
export function toDomainErrorFromApiError(error: ApiError | undefined): DomainError {
  const code = error?.code ?? '';
  const message = error?.message ?? '';

  switch (error?.type) {
    case ErrorType.Validation:
      return new ValidationError(message, [], code);
    case ErrorType.NotFound:
      return new NotFoundError(message, code);
    case ErrorType.Conflict:
      return new ConflictError(message, code);
    case ErrorType.Problem:
      return new BusinessRuleError(message, code);
    default:
      return new ServiceUnavailableError(message);
  }
}

function toProblemDetails(body: unknown): ProblemDetails {
  return typeof body === 'object' && body !== null ? (body as ProblemDetails) : {};
}

function toIssues(errors: ApiError[]): ValidationIssue[] {
  return errors.map(({ code, message }) => ({ code, message }));
}
