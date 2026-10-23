import { InvalidCredentialsError } from '@core/auth/invalid-credentials.error';
import { AccessDeniedError } from '@shared/models/errors/access-denied.error';
import { ValidationError } from '@shared/models/errors/validation.error';
import { signInErrorKey } from './sign-in-error';

describe('signInErrorKey', () => {
  it('should name the wrong credentials when the backend rejects the login', () => {
    expect(signInErrorKey(new InvalidCredentialsError())).toBe(
      'coachApp.signIn.invalidCredentials',
    );
  });

  it('should ask to check the input when the backend reports a validation error', () => {
    expect(signInErrorKey(new ValidationError('bad'))).toBe('coachApp.signIn.validation');
  });

  it('should leave other errors to the generic message when the cause is unrelated', () => {
    expect(signInErrorKey(new AccessDeniedError())).toBeNull();
  });
});
