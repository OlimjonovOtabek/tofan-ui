import { ConflictError } from '@shared/models/errors/conflict.error';
import { TrainerDraft } from './trainer-draft';

export type TrainerAccountField = 'username' | 'email';

export interface TakenTrainerAccount {
  readonly field: TrainerAccountField;
  readonly value: string;
}

const ACCOUNT_FIELDS_BY_CODE: Readonly<Record<string, TrainerAccountField>> = {
  'User.UsernameTaken': 'username',
  'User.EmailTaken': 'email',
};

export function toTakenTrainerAccount(
  error: unknown,
  draft: TrainerDraft,
): TakenTrainerAccount | null {
  if (!(error instanceof ConflictError)) {
    return null;
  }
  const field = ACCOUNT_FIELDS_BY_CODE[error.code];
  return field === undefined ? null : { field, value: draft[field] };
}

export function isTakenAccountValue(
  taken: TakenTrainerAccount | null,
  field: TrainerAccountField,
  value: string,
): boolean {
  return taken?.field === field && normalized(taken.value) === normalized(value);
}

function normalized(value: string): string {
  return value.trim().toLowerCase();
}
