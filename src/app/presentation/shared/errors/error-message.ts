import { InvalidCredentialsError } from '@domain/auth/errors/invalid-credentials.error';
import { SessionExpiredError } from '@domain/auth/errors/session-expired.error';
import { AccessDeniedError } from '@domain/shared/errors/access-denied.error';
import { BusinessRuleError } from '@domain/shared/errors/business-rule.error';
import { ConflictError } from '@domain/shared/errors/conflict.error';
import { DomainError } from '@domain/shared/errors/domain.error';
import { NotFoundError } from '@domain/shared/errors/not-found.error';
import { ValidationError } from '@domain/shared/errors/validation.error';

/** Uzbek wording for the backend error codes we have already met. */
const MESSAGES_BY_CODE: Record<string, string> = {
  'Authentication.InvalidCredentials': "Login yoki parol noto'g'ri.",
  'Authentication.InvalidRefreshToken': 'Sessiya tugadi. Qaytadan kiring.',
  'IdentityProvider.UserNotFound': 'Bunday foydalanuvchi topilmadi.',
  'NotificationTemplate.Conflict':
    'Bu tur va uslub uchun faol shablon allaqachon bor. Avval uni faolsizlantiring.',
  'NotificationTemplate.NoActiveTemplate':
    'Bu tur uchun foydalanuvchi uslubiga mos faol shablon topilmadi.',
  'NotificationPreference.Disabled':
    "Foydalanuvchi bu turdagi bildirishnomalarni o'chirib qo'ygan.",
  'PushNotification.NoActiveDevice': "Foydalanuvchining push qabul qiladigan faol qurilmasi yo'q.",
  'PushNotification.DispatchFailed': 'Push xizmati bildirishnomani yetkaza olmadi.',
  'PushNotification.Disabled': "Bu muhitda push bildirishnomalar o'chirilgan.",
  'PushNotification.ConfigurationInvalid':
    'Push xizmati sozlanmagan (Firebase kalitlari yo‘q). Administratorga murojaat qiling.',
  'UserId.Empty': 'Foydalanuvchi ID kiritilishi shart.',
  'UserId.Invalid': 'Foydalanuvchi ID UUID ko‘rinishida bo‘lishi kerak.',
  'Data.KeyEmpty': 'Qo‘shimcha ma’lumotdagi har bir qiymatning kaliti bo‘lishi kerak.',
  'Data.KeyDuplicate': 'Qo‘shimcha ma’lumotda kalitlar takrorlanmasligi kerak.',
};

/** Single place that turns any error into text a user can act on. */
export function toErrorMessage(error: unknown): string {
  if (!(error instanceof DomainError)) {
    return "Serverga ulanib bo'lmadi. Keyinroq qayta urinib ko'ring.";
  }

  const knownMessage = MESSAGES_BY_CODE[error.code];
  if (knownMessage !== undefined) {
    return knownMessage;
  }

  if (error instanceof InvalidCredentialsError) {
    return "Login yoki parol noto'g'ri.";
  }
  if (error instanceof SessionExpiredError) {
    return 'Sessiya tugadi. Qaytadan kiring.';
  }
  if (error instanceof AccessDeniedError) {
    return "Bu amal uchun ruxsatingiz yo'q.";
  }
  if (error instanceof ValidationError) {
    return error.issues.length === 0
      ? "Ma'lumotlar to'g'ri to'ldirilmagan."
      : error.issues.map((issue) => MESSAGES_BY_CODE[issue.code] ?? issue.message).join(' ');
  }
  if (error instanceof NotFoundError) {
    return "Ma'lumot topilmadi — u o'chirilgan bo'lishi mumkin.";
  }
  if (error instanceof ConflictError) {
    return "Bunday ma'lumot allaqachon mavjud.";
  }
  if (error instanceof BusinessRuleError && error.message.length > 0) {
    return error.message;
  }
  return "Amalni bajarib bo'lmadi. Keyinroq qayta urinib ko'ring.";
}
