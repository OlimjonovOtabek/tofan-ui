import { ValidationError } from '@shared/models/errors/validation.error';

export const TRAINER_USERNAME_PATTERN = /^[A-Za-z0-9._@-]+$/;
export const TRAINER_USERNAME_MAX_LENGTH = 128;
export const TRAINER_EMAIL_MAX_LENGTH = 320;
export const TRAINER_PHONE_MAX_LENGTH = 32;
export const TRAINER_PASSWORD_MIN_LENGTH = 8;
export const TRAINER_PASSWORD_MAX_LENGTH = 128;
export const TRAINER_DISPLAY_NAME_MAX_LENGTH = 200;
export const TRAINER_BIO_MAX_LENGTH = 2000;

export interface TrainerDraft {
  readonly username: string;
  readonly email: string;
  readonly phoneNumber: string | null;
  readonly password: string;
  readonly displayName: string;
  readonly bio: string | null;
  readonly photoFileId: string | null;
}

export function createTrainerDraft(draft: TrainerDraft): TrainerDraft {
  const username = draft.username.trim();
  if (!TRAINER_USERNAME_PATTERN.test(username)) {
    throw new ValidationError('The username has characters Keycloak rejects.', [
      { code: 'User.InvalidUsername', message: 'The username is not valid.' },
    ]);
  }
  return {
    username,
    email: draft.email.trim(),
    phoneNumber: toOptionalText(draft.phoneNumber),
    password: draft.password,
    displayName: requireDisplayName(draft.displayName),
    bio: toOptionalText(draft.bio),
    photoFileId: draft.photoFileId,
  };
}

export function requireDisplayName(displayName: string): string {
  const trimmed = displayName.trim();
  if (trimmed.length === 0) {
    throw new ValidationError('The display name is empty.', [
      { code: 'Trainer.DisplayNameEmpty', message: 'The display name is required.' },
    ]);
  }
  return trimmed;
}

export function toOptionalText(text: string | null): string | null {
  const trimmed = text?.trim() ?? '';
  return trimmed.length === 0 ? null : trimmed;
}
