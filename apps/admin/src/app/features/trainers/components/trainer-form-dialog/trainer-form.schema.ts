import { Signal } from '@angular/core';
import { TranslationKey } from '@core/i18n/dictionary';
import {
  Schema,
  maxLength,
  minLength,
  pattern,
  required,
  schema,
  validate,
} from '@angular/forms/signals';
import { TakenTrainerAccount, takenAccountError } from '../../models/taken-trainer-account';
import {
  TRAINER_PASSWORD_MAX_LENGTH,
  TRAINER_PASSWORD_MIN_LENGTH,
  TRAINER_USERNAME_MAX_LENGTH,
  TRAINER_USERNAME_PATTERN,
  TrainerDraft,
} from '../../models/trainer-draft';
import { applyCardRules, applyEmailRules, applyPhoneRules } from './trainer-field.rules';

const ERRORS = {
  username: 'trainers.form.errors.username',
  usernameTaken: 'trainers.form.errors.usernameTaken',
  password: 'trainers.form.errors.password',
} as const satisfies Record<string, TranslationKey>;

export interface TrainerFormValue {
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  displayName: string;
  bio: string;
}

export function emptyTrainerFormValue(): TrainerFormValue {
  return { username: '', email: '', phoneNumber: '', password: '', displayName: '', bio: '' };
}

export function toTrainerDraft(value: TrainerFormValue, photoFileId: string | null): TrainerDraft {
  return {
    username: value.username,
    email: value.email,
    phoneNumber: value.phoneNumber,
    password: value.password,
    displayName: value.displayName,
    bio: value.bio,
    photoFileId,
  };
}

export function trainerFormSchema(
  takenAccount: Signal<TakenTrainerAccount | null>,
): Schema<TrainerFormValue> {
  return schema<TrainerFormValue>((path) => {
    required(path.username, { message: ERRORS.username });
    pattern(path.username, TRAINER_USERNAME_PATTERN, { message: ERRORS.username });
    maxLength(path.username, TRAINER_USERNAME_MAX_LENGTH, { message: ERRORS.username });
    validate(path.username, ({ value }) =>
      takenAccountError(takenAccount(), 'username', value(), ERRORS.usernameTaken),
    );
    applyEmailRules(path.email, takenAccount);
    applyPhoneRules(path.phoneNumber);
    required(path.password, { message: ERRORS.password });
    minLength(path.password, TRAINER_PASSWORD_MIN_LENGTH, { message: ERRORS.password });
    maxLength(path.password, TRAINER_PASSWORD_MAX_LENGTH, { message: ERRORS.password });
    applyCardRules(path.displayName, path.bio);
  });
}
