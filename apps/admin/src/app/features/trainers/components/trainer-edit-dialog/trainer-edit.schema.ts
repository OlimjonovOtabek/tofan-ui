import { Signal } from '@angular/core';
import { TranslationKey } from '@core/i18n/dictionary';
import {
  Schema,
  ValidationResult,
  min,
  minError,
  required,
  schema,
  validate,
} from '@angular/forms/signals';
import { TakenTrainerAccount } from '../../models/taken-trainer-account';
import { Trainer } from '../../models/trainer';
import { TrainerAccount } from '../../models/trainer-account';
import { TrainerEditDraft } from '../../models/trainer-edit-draft';
import {
  applyCardRules,
  applyEmailRules,
  applyPhoneRules,
} from '../trainer-form-dialog/trainer-field.rules';

const MONTHLY_PRICE_ERROR: TranslationKey = 'trainers.edit.errors.monthlyPrice';
const VIP_PRICE_ERROR: TranslationKey = 'trainers.edit.errors.vipPrice';

export interface TrainerEditFormValue {
  email: string;
  phoneNumber: string;
  displayName: string;
  bio: string;
  monthlyPrice: number | null;
  vipMonthlyPrice: number | null;
}

export function toTrainerEditFormValue(
  trainer: Trainer,
  account: TrainerAccount,
): TrainerEditFormValue {
  return {
    email: account.email,
    phoneNumber: account.phoneNumber ?? '',
    displayName: trainer.displayName,
    bio: trainer.bio ?? '',
    monthlyPrice: trainer.monthlyPrice,
    vipMonthlyPrice: trainer.vipMonthlyPrice,
  };
}

export function toTrainerEditDraft(
  value: TrainerEditFormValue,
  photoFileId: string | null,
): TrainerEditDraft {
  return {
    email: value.email,
    phoneNumber: value.phoneNumber,
    displayName: value.displayName,
    bio: value.bio,
    photoFileId,
    monthlyPrice: value.monthlyPrice ?? 0,
    vipMonthlyPrice: value.vipMonthlyPrice,
  };
}

function vipPriceError(price: number | null): ValidationResult {
  if (price === null || price > 0) {
    return null;
  }
  return minError(0, { message: VIP_PRICE_ERROR });
}

export function trainerEditFormSchema(
  takenAccount: Signal<TakenTrainerAccount | null>,
): Schema<TrainerEditFormValue> {
  return schema<TrainerEditFormValue>((path) => {
    applyEmailRules(path.email, takenAccount);
    applyPhoneRules(path.phoneNumber);
    applyCardRules(path.displayName, path.bio);
    required(path.monthlyPrice, { message: MONTHLY_PRICE_ERROR });
    min(path.monthlyPrice, 0, { message: MONTHLY_PRICE_ERROR });
    validate(path.vipMonthlyPrice, ({ value }) => vipPriceError(value()));
  });
}
