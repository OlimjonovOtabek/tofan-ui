import { ValidationError, ValidationIssue } from '@shared/models/errors/validation.error';
import {
  COMMISSION_AMOUNT_MIN,
  PERCENT_MAX,
  PERCENT_MIN,
  PLATFORM_FEE_FRACTION_DIGITS,
  isValidCommissionAmount,
  isValidPercent,
} from './platform-fee-rules';

export interface PlatformFeeDraft {
  readonly commissionAmount: number;
  readonly taxPercent: number;
  readonly providerFeePercent: number;
}

export function createPlatformFeeDraft(draft: PlatformFeeDraft): PlatformFeeDraft {
  const issues: ValidationIssue[] = [
    ...commissionAmountIssues(draft.commissionAmount),
    ...percentIssues('TaxPercent', draft.taxPercent),
    ...percentIssues('ProviderFeePercent', draft.providerFeePercent),
  ];
  if (issues.length > 0) {
    throw new ValidationError('The platform fee is not valid.', issues);
  }
  return draft;
}

function commissionAmountIssues(amount: number): ValidationIssue[] {
  if (isValidCommissionAmount(amount)) {
    return [];
  }
  return [
    {
      code: 'CommissionAmount.Invalid',
      message: `CommissionAmount must be at least ${COMMISSION_AMOUNT_MIN} with at most ${PLATFORM_FEE_FRACTION_DIGITS} decimals.`,
    },
  ];
}

function percentIssues(name: string, percent: number): ValidationIssue[] {
  if (isValidPercent(percent)) {
    return [];
  }
  return [
    {
      code: `${name}.Invalid`,
      message: `${name} must be from ${PERCENT_MIN} to ${PERCENT_MAX} with at most ${PLATFORM_FEE_FRACTION_DIGITS} decimals.`,
    },
  ];
}
