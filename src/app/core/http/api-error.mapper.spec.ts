import { HttpErrorResponse } from '@angular/common/http';
import { SessionExpiredError } from '@core/auth/session-expired.error';
import { AccessDeniedError } from '@shared/models/errors/access-denied.error';
import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { ConflictError } from '@shared/models/errors/conflict.error';
import { NotFoundError } from '@shared/models/errors/not-found.error';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { ValidationError } from '@shared/models/errors/validation.error';
import { toDomainError, toDomainErrorFromApiError } from './api-error.mapper';
import { ErrorType } from './api.dto';

function problem(status: number, body: unknown): HttpErrorResponse {
  return new HttpErrorResponse({ status, error: body });
}

describe('toDomainError', () => {
  it('maps a rejected business rule, keeping the backend code', () => {
    const error = toDomainError(
      problem(400, {
        title: 'Authentication.InvalidCredentials',
        detail: 'The provided credentials are invalid.',
      }),
    );

    expect(error).toBeInstanceOf(BusinessRuleError);
    expect(error.code).toBe('Authentication.InvalidCredentials');
    expect(error.message).toBe('The provided credentials are invalid.');
  });

  it('collects the issues of a validation failure', () => {
    const error = toDomainError(
      problem(400, {
        title: 'General.Validation',
        detail: 'One or more validation errors occurred',
        errors: [{ code: 'Name.Empty', message: 'Name is required.', type: ErrorType.Validation }],
      }),
    );

    expect(error).toBeInstanceOf(ValidationError);
    expect((error as ValidationError).issues).toEqual([
      { code: 'Name.Empty', message: 'Name is required.' },
    ]);
  });

  it('maps the remaining statuses', () => {
    expect(toDomainError(problem(401, null))).toBeInstanceOf(SessionExpiredError);
    expect(toDomainError(problem(403, null))).toBeInstanceOf(AccessDeniedError);
    expect(toDomainError(problem(404, { title: 'Exercise.NotFound' }))).toBeInstanceOf(
      NotFoundError,
    );
    expect(toDomainError(problem(409, { title: 'Food.Duplicate' }))).toBeInstanceOf(ConflictError);
    expect(toDomainError(problem(500, null))).toBeInstanceOf(ServiceUnavailableError);
  });

  it('treats an unreachable backend as a service failure', () => {
    expect(toDomainError(new Error('offline'))).toBeInstanceOf(ServiceUnavailableError);
  });

  it('passes a domain error through untouched', () => {
    const original = new NotFoundError('gone', 'Exercise.NotFound');

    expect(toDomainError(original)).toBe(original);
  });
});

describe('toDomainErrorFromApiError', () => {
  it('maps the error type of a failed envelope', () => {
    expect(
      toDomainErrorFromApiError({
        code: 'Exercise.NotFound',
        message: 'Not found',
        type: ErrorType.NotFound,
      }),
    ).toBeInstanceOf(NotFoundError);
    expect(
      toDomainErrorFromApiError({
        code: 'Food.Duplicate',
        message: 'Exists',
        type: ErrorType.Conflict,
      }),
    ).toBeInstanceOf(ConflictError);
    expect(
      toDomainErrorFromApiError({
        code: 'Plan.Locked',
        message: 'Locked',
        type: ErrorType.Problem,
      }),
    ).toBeInstanceOf(BusinessRuleError);
    expect(toDomainErrorFromApiError(undefined)).toBeInstanceOf(ServiceUnavailableError);
  });
});
