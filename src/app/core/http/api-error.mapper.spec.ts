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
  it('should keep the backend code when a business rule is rejected', () => {
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

  it('should collect the issues when validation fails', () => {
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

  it('should map each status when the backend answers with an error', () => {
    expect(toDomainError(problem(401, null))).toBeInstanceOf(SessionExpiredError);
    expect(toDomainError(problem(403, null))).toBeInstanceOf(AccessDeniedError);
    expect(toDomainError(problem(404, { title: 'Exercise.NotFound' }))).toBeInstanceOf(
      NotFoundError,
    );
    expect(toDomainError(problem(409, { title: 'Food.Duplicate' }))).toBeInstanceOf(ConflictError);
    expect(toDomainError(problem(500, null))).toBeInstanceOf(ServiceUnavailableError);
  });

  it('should keep the backend title when the server fails', () => {
    const error = toDomainError(problem(500, { title: 'GetUsersQuery', detail: 'Keycloak down' }));

    expect(error).toBeInstanceOf(ServiceUnavailableError);
    expect(error.code).toBe('GetUsersQuery');
  });

  it('should report a service failure when the backend is unreachable', () => {
    expect(toDomainError(new Error('offline'))).toBeInstanceOf(ServiceUnavailableError);
  });

  it('should pass the error through when it is already a domain error', () => {
    const original = new NotFoundError('gone', 'Exercise.NotFound');

    expect(toDomainError(original)).toBe(original);
  });
});

describe('toDomainErrorFromApiError', () => {
  it('should map the error type when a result envelope failed', () => {
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
