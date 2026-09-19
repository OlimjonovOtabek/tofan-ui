import { InvalidCredentialsError } from '@core/auth/invalid-credentials.error';
import { SessionExpiredError } from '@core/auth/session-expired.error';
import { AccessDeniedError } from '@shared/models/errors/access-denied.error';
import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { ConflictError } from '@shared/models/errors/conflict.error';
import { DomainError } from '@shared/models/errors/domain.error';
import { NotFoundError } from '@shared/models/errors/not-found.error';
import { ValidationError } from '@shared/models/errors/validation.error';

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
  'StoredFile.InUse':
    'Fayl mashq videosi sifatida ishlatilmoqda. Avval uni mashqdan olib tashlang.',
  'StoredFile.NotFound': 'Fayl topilmadi — u allaqachon o‘chirilgan bo‘lishi mumkin.',
  'StoredFile.Empty': 'Tanlangan fayl bo‘sh.',
  'StoredFile.UnsupportedContent': 'Bu fayl turi tanlangan kategoriya uchun qabul qilinmaydi.',
  'StoredFile.TooLarge': 'Fayl bu kategoriya uchun ruxsat etilgan hajmdan katta.',
  'User.NotFound': 'Hisob topilmadi — u Keycloak’dan o‘chirilgan bo‘lishi mumkin.',
  'User.AlreadyBlocked': 'Hisob allaqachon bloklangan.',
  'User.NotBlocked': 'Hisob bloklanmagan.',
  'User.CannotBlockSelf': 'O‘z hisobingizni bloklay olmaysiz.',
  GetUsersQuery:
    'Hisoblarni Keycloak’dan o‘qib bo‘lmadi. Rol filtri tanlangan bo‘lsa, u hozircha ishlamasligi mumkin (Keycloak sozlamasi kerak).',
};

export function toErrorMessage(error: unknown): string {
  if (!(error instanceof DomainError)) {
    return "Serverga ulanib bo'lmadi. Keyinroq qayta urinib ko'ring.";
  }

  return MESSAGES_BY_CODE[error.code] ?? messageForErrorClass(error);
}

function messageForErrorClass(error: DomainError): string {
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
    return validationMessage(error);
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

function validationMessage(error: ValidationError): string {
  return error.issues.length === 0
    ? "Ma'lumotlar to'g'ri to'ldirilmagan."
    : error.issues.map((issue) => MESSAGES_BY_CODE[issue.code] ?? issue.message).join(' ');
}
