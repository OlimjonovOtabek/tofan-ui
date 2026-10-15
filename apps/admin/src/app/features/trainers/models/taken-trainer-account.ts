import { TranslationKey } from '@core/i18n/dictionary';
import { ConflictError } from '@shared/models/errors/conflict.error';

export type TrainerAccountField = 'username' | 'email';

export interface TakenTrainerAccount {
  readonly field: TrainerAccountField;
  readonly value: string;
}

export type SentAccountValues = Readonly<Partial<Record<TrainerAccountField, string>>>;

const ACCOUNT_FIELDS_BY_CODE: Readonly<Record<string, TrainerAccountField>> = {
  'User.UsernameTaken': 'username',
  'User.EmailTaken': 'email',
};

export function toTakenTrainerAccount(
  error: unknown,
  sent: SentAccountValues,
): TakenTrainerAccount | null {
  if (!(error instanceof ConflictError)) {
    return null;
  }
  const field = ACCOUNT_FIELDS_BY_CODE[error.code];
  const value = field === undefined ? undefined : sent[field];
  return field === undefined || value === undefined ? null : { field, value };
}

export function isTakenAccountValue(
  taken: TakenTrainerAccount | null,
  field: TrainerAccountField,
  value: string,
): boolean {
  return taken?.field === field && normalized(taken.value) === normalized(value);
}

export interface TakenAccountValidationError {
  readonly kind: 'taken';
  readonly message: TranslationKey;
}

export function takenAccountError(
  taken: TakenTrainerAccount | null,
  field: TrainerAccountField,
  value: string,
  message: TranslationKey,
): TakenAccountValidationError | null {
  return isTakenAccountValue(taken, field, value) ? { kind: 'taken', message } : null;
}

function normalized(value: string): string {
  return value.trim().toLowerCase();
}
