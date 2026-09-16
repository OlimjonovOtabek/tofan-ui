import { InvalidCredentialsError } from '@core/auth/invalid-credentials.error';
import { AccessDeniedError } from '@shared/models/errors/access-denied.error';
import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { ConflictError } from '@shared/models/errors/conflict.error';
import { NotFoundError } from '@shared/models/errors/not-found.error';
import { ValidationError } from '@shared/models/errors/validation.error';
import { toErrorMessage } from './error-message';

describe('toErrorMessage', () => {
  it('prefers the wording we have for a known backend code', () => {
    const error = new BusinessRuleError('Invalid credentials', 'Authentication.InvalidCredentials');

    expect(toErrorMessage(error)).toBe("Login yoki parol noto'g'ri.");
  });

  it('lists what the validator complained about', () => {
    const error = new ValidationError('invalid', [
      { code: 'Name.Empty', message: 'Nom kiritilmagan.' },
      { code: 'Name.TooLong', message: 'Nom juda uzun.' },
    ]);

    expect(toErrorMessage(error)).toBe('Nom kiritilmagan. Nom juda uzun.');
  });

  it('has wording for every error type we map', () => {
    expect(toErrorMessage(new InvalidCredentialsError())).toContain("noto'g'ri");
    expect(toErrorMessage(new AccessDeniedError())).toContain('ruxsat');
    expect(toErrorMessage(new NotFoundError('gone', 'Exercise.NotFound'))).toContain('topilmadi');
    expect(toErrorMessage(new ConflictError('exists', 'Food.Duplicate'))).toContain('mavjud');
  });

  it('falls back to the backend text of an unknown rule', () => {
    expect(toErrorMessage(new BusinessRuleError('Plan is locked.', 'Plan.Locked'))).toBe(
      'Plan is locked.',
    );
  });

  it('treats anything that is not a domain error as a connection problem', () => {
    expect(toErrorMessage(new Error('boom'))).toContain("Serverga ulanib bo'lmadi");
  });
});
