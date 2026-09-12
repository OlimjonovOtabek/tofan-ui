import { InvalidCredentialsError } from '@domain/auth/errors/invalid-credentials.error';
import { ValidationError } from '@domain/shared/errors/validation.error';

export function toAuthErrorMessage(error: unknown): string {
  if (error instanceof InvalidCredentialsError) {
    return "Login yoki parol noto'g'ri.";
  }
  if (error instanceof ValidationError) {
    return 'Login va parolni kiriting.';
  }
  return "Serverga ulanib bo'lmadi. Keyinroq qayta urinib ko'ring.";
}
