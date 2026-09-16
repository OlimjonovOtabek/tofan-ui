import { InvalidCredentialsError } from '@core/auth/invalid-credentials.error';
import { AccessDeniedError } from '@shared/models/errors/access-denied.error';
import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { ConflictError } from '@shared/models/errors/conflict.error';
import { NotFoundError } from '@shared/models/errors/not-found.error';
import { ValidationError } from '@shared/models/errors/validation.error';
import { toErrorMessage } from './error-message';

describe('toErrorMessage', () => {
  it('should use our wording when the backend code is known', () => {
    const error = new BusinessRuleError('Invalid credentials', 'Authentication.InvalidCredentials');

    expect(toErrorMessage(error)).toBe("Login yoki parol noto'g'ri.");
  });

  it('should list every issue when validation fails', () => {
    const error = new ValidationError('invalid', [
      { code: 'Name.Empty', message: 'Nom kiritilmagan.' },
      { code: 'Name.TooLong', message: 'Nom juda uzun.' },
    ]);

    expect(toErrorMessage(error)).toBe('Nom kiritilmagan. Nom juda uzun.');
  });

  it('should have wording when any mapped error type occurs', () => {
    expect(toErrorMessage(new InvalidCredentialsError())).toContain("noto'g'ri");
    expect(toErrorMessage(new AccessDeniedError())).toContain('ruxsat');
    expect(toErrorMessage(new NotFoundError('gone', 'Exercise.NotFound'))).toContain('topilmadi');
    expect(toErrorMessage(new ConflictError('exists', 'Food.Duplicate'))).toContain('mavjud');
  });

  it('should show the backend text when a business rule is unknown', () => {
    expect(toErrorMessage(new BusinessRuleError('Plan is locked.', 'Plan.Locked'))).toBe(
      'Plan is locked.',
    );
  });

  it('should report a connection problem when the error is not a domain error', () => {
    expect(toErrorMessage(new Error('boom'))).toContain("Serverga ulanib bo'lmadi");
  });
});
