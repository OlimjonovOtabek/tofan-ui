import { InvalidCredentialsError } from '@core/auth/invalid-credentials.error';
import { AccessDeniedError } from '@shared/models/errors/access-denied.error';
import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { ConflictError } from '@shared/models/errors/conflict.error';
import { NotFoundError } from '@shared/models/errors/not-found.error';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { ValidationError } from '@shared/models/errors/validation.error';
import { toErrorMessage } from './error-message';

describe('toErrorMessage', () => {
  it('should format backend codes from dictionary', () => {
    const error = new InvalidCredentialsError();
    expect(toErrorMessage(error)).toBe('errors.classes.invalidCredentials');
  });

  it('should fallback to error class message for unknown code', () => {
    const error = new NotFoundError('gone', 'Unknown.Code');
    expect(toErrorMessage(error)).toBe('errors.classes.notFound');
  });

  it('should format ValidationError correctly', () => {
    const error = new ValidationError('invalid', [
      { code: 'StoredFile.UnsupportedContent', message: 'fallback' },
    ]);
    expect(toErrorMessage(error)).toBe('errors.backend.StoredFile.UnsupportedContent');
  });

  it('should map standard errors to generic fallback', () => {
    const error = new ValidationError('invalid', [
      { code: 'Unknown.Code', message: 'Nom kiritilmagan.' },
      { code: 'Unknown.Code2', message: 'Nom juda uzun.' },
    ]);
    expect(toErrorMessage(error)).toBe('Nom kiritilmagan. Nom juda uzun.');
  });

  it('should map specific error classes', () => {
    expect(toErrorMessage(new InvalidCredentialsError())).toBe('errors.classes.invalidCredentials');
    expect(toErrorMessage(new AccessDeniedError())).toBe('errors.classes.accessDenied');
    expect(toErrorMessage(new NotFoundError('gone', 'Exercise.NotFound'))).toBe(
      'errors.classes.notFound',
    );
    expect(toErrorMessage(new ConflictError('exists', 'Food.Duplicate'))).toBe(
      'errors.classes.conflict',
    );
  });

  it('should map BusinessRuleError to its message', () => {
    expect(toErrorMessage(new BusinessRuleError('errors.backend.Plan.Locked', 'Plan.Locked'))).toBe(
      'errors.backend.Plan.Locked',
    );
  });

  it('should map ServiceUnavailableError to the network message', () => {
    expect(toErrorMessage(new ServiceUnavailableError())).toBe('errors.classes.network');
  });

  it('should map an error thrown inside the panel to the generic message', () => {
    expect(toErrorMessage(new Error('The API returned the unknown enum value 0.'))).toBe(
      'errors.classes.generic',
    );
  });
});
