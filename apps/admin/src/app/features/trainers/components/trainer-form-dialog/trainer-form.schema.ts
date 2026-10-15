import { Signal } from '@angular/core';
import { TranslationKey } from '@core/i18n/dictionary';
import {
  Schema,
  ValidationResult,
  email,
  maxLength,
  minLength,
  pattern,
  required,
  schema,
  validate,
} from '@angular/forms/signals';
import { TakenTrainerAccount, isTakenAccountValue } from '../../models/taken-trainer-account';
import {
  TRAINER_DISPLAY_NAME_MAX_LENGTH,
  TRAINER_EMAIL_MAX_LENGTH,
  TRAINER_PASSWORD_MAX_LENGTH,
  TRAINER_PASSWORD_MIN_LENGTH,
  TRAINER_PHONE_MAX_LENGTH,
  TRAINER_USERNAME_MAX_LENGTH,
  TRAINER_USERNAME_PATTERN,
  TrainerDraft,
} from '../../models/trainer-draft';

const ERRORS = {
  username: 'trainers.form.errors.username',
  email: 'trainers.form.errors.email',
  phoneNumber: 'trainers.form.errors.phoneNumber',
  password: 'trainers.form.errors.password',
  displayName: 'trainers.form.errors.displayName',
  usernameTaken: 'trainers.form.errors.usernameTaken',
  emailTaken: 'trainers.form.errors.emailTaken',
} as const satisfies Record<string, TranslationKey>;

const NON_BLANK_PATTERN = /\S/;
const TAKEN_ERROR_KIND = 'taken';

export interface TrainerFormValue {
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  displayName: string;
}

export function emptyTrainerFormValue(): TrainerFormValue {
  return { username: '', email: '', phoneNumber: '', password: '', displayName: '' };
}

export function toTrainerDraft(value: TrainerFormValue, photoFileId: string | null): TrainerDraft {
  return {
    username: value.username,
    email: value.email,
    phoneNumber: value.phoneNumber,
    password: value.password,
    displayName: value.displayName,
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
      takenError(isTakenAccountValue(takenAccount(), 'username', value()), ERRORS.usernameTaken),
    );
    required(path.email, { message: ERRORS.email });
    email(path.email, { message: ERRORS.email });
    maxLength(path.email, TRAINER_EMAIL_MAX_LENGTH, { message: ERRORS.email });
    validate(path.email, ({ value }) =>
      takenError(isTakenAccountValue(takenAccount(), 'email', value()), ERRORS.emailTaken),
    );
    maxLength(path.phoneNumber, TRAINER_PHONE_MAX_LENGTH, { message: ERRORS.phoneNumber });
    required(path.password, { message: ERRORS.password });
    minLength(path.password, TRAINER_PASSWORD_MIN_LENGTH, { message: ERRORS.password });
    maxLength(path.password, TRAINER_PASSWORD_MAX_LENGTH, { message: ERRORS.password });
    required(path.displayName, { message: ERRORS.displayName });
    pattern(path.displayName, NON_BLANK_PATTERN, { message: ERRORS.displayName });
    maxLength(path.displayName, TRAINER_DISPLAY_NAME_MAX_LENGTH, { message: ERRORS.displayName });
  });
}

function takenError(isTaken: boolean, message: TranslationKey): ValidationResult {
  return isTaken ? { kind: TAKEN_ERROR_KIND, message } : null;
}
