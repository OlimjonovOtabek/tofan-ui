import { InvalidCredentialsError } from '@core/auth/invalid-credentials.error';
import { TranslationKey } from '@core/i18n/dictionary';
import { ValidationError } from '@shared/models/errors/validation.error';

export function signInErrorKey(error: unknown): TranslationKey | null {
  if (error instanceof InvalidCredentialsError) {
    return 'coachApp.signIn.invalidCredentials';
  }
  if (error instanceof ValidationError) {
    return 'coachApp.signIn.validation';
  }
  return null;
}
