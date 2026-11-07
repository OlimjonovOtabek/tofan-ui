import { TranslationKey } from '@core/i18n/dictionary';
import { Schema, SchemaPath, max, min, required, schema, validate } from '@angular/forms/signals';
import { PlatformFee } from '../../models/platform-fee';
import { PlatformFeeDraft } from '../../models/platform-fee-draft';
import {
  COMMISSION_AMOUNT_MIN,
  PERCENT_MAX,
  PERCENT_MIN,
  isValidCommissionAmount,
  isValidPercent,
} from '../../models/platform-fee-rules';

const COMMISSION_AMOUNT_ERROR: TranslationKey = 'platformFee.errors.commissionAmount';
const PERCENT_ERROR: TranslationKey = 'platformFee.errors.percent';
const NUMBER_ERROR_KIND = 'platformFeeNumber';

export interface PlatformFeeFormValue {
  commissionAmount: number | null;
  taxPercent: number | null;
  providerFeePercent: number | null;
}

export function toPlatformFeeFormValue(fee: PlatformFee): PlatformFeeFormValue {
  return {
    commissionAmount: fee.commissionAmount,
    taxPercent: fee.taxPercent,
    providerFeePercent: fee.providerFeePercent,
  };
}

export function toPlatformFeeDraft(value: PlatformFeeFormValue): PlatformFeeDraft | null {
  const { commissionAmount, taxPercent, providerFeePercent } = value;
  if (commissionAmount === null || taxPercent === null || providerFeePercent === null) {
    return null;
  }
  return { commissionAmount, taxPercent, providerFeePercent };
}

export const platformFeeFormSchema: Schema<PlatformFeeFormValue> = schema<PlatformFeeFormValue>(
  (path) => {
    required(path.commissionAmount, { message: COMMISSION_AMOUNT_ERROR });
    min(path.commissionAmount, COMMISSION_AMOUNT_MIN, { message: COMMISSION_AMOUNT_ERROR });
    validateNumber(path.commissionAmount, isValidCommissionAmount, COMMISSION_AMOUNT_ERROR);
    applyPercentRules(path.taxPercent);
    applyPercentRules(path.providerFeePercent);
  },
);

function applyPercentRules(field: SchemaPath<number | null>): void {
  required(field, { message: PERCENT_ERROR });
  min(field, PERCENT_MIN, { message: PERCENT_ERROR });
  max(field, PERCENT_MAX, { message: PERCENT_ERROR });
  validateNumber(field, isValidPercent, PERCENT_ERROR);
}

function validateNumber(
  field: SchemaPath<number | null>,
  isValid: (value: number) => boolean,
  message: TranslationKey,
): void {
  validate(field, ({ value }) => {
    const current = value();
    return current === null || isValid(current) ? null : { kind: NUMBER_ERROR_KIND, message };
  });
}
