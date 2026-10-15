import { Signal } from '@angular/core';
import { TranslationKey } from '@core/i18n/dictionary';
import { SchemaPath, email, maxLength, pattern, required, validate } from '@angular/forms/signals';
import { TakenTrainerAccount, takenAccountError } from '../../models/taken-trainer-account';
import {
  TRAINER_BIO_MAX_LENGTH,
  TRAINER_DISPLAY_NAME_MAX_LENGTH,
  TRAINER_EMAIL_MAX_LENGTH,
  TRAINER_PHONE_MAX_LENGTH,
} from '../../models/trainer-draft';

const ERRORS = {
  email: 'trainers.form.errors.email',
  emailTaken: 'trainers.form.errors.emailTaken',
  phoneNumber: 'trainers.form.errors.phoneNumber',
  displayName: 'trainers.form.errors.displayName',
  bio: 'trainers.form.errors.bio',
} as const satisfies Record<string, TranslationKey>;

const NON_BLANK_PATTERN = /\S/;

export function applyEmailRules(
  path: SchemaPath<string>,
  takenAccount: Signal<TakenTrainerAccount | null>,
): void {
  required(path, { message: ERRORS.email });
  email(path, { message: ERRORS.email });
  maxLength(path, TRAINER_EMAIL_MAX_LENGTH, { message: ERRORS.email });
  validate(path, ({ value }) =>
    takenAccountError(takenAccount(), 'email', value(), ERRORS.emailTaken),
  );
}

export function applyPhoneRules(path: SchemaPath<string>): void {
  maxLength(path, TRAINER_PHONE_MAX_LENGTH, { message: ERRORS.phoneNumber });
}

export function applyCardRules(displayName: SchemaPath<string>, bio: SchemaPath<string>): void {
  required(displayName, { message: ERRORS.displayName });
  pattern(displayName, NON_BLANK_PATTERN, { message: ERRORS.displayName });
  maxLength(displayName, TRAINER_DISPLAY_NAME_MAX_LENGTH, { message: ERRORS.displayName });
  maxLength(bio, TRAINER_BIO_MAX_LENGTH, { message: ERRORS.bio });
}
