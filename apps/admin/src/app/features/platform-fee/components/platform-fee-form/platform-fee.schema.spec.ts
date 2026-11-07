import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { PlatformFee } from '../../models/platform-fee';
import {
  PlatformFeeFormValue,
  platformFeeFormSchema,
  toPlatformFeeDraft,
  toPlatformFeeFormValue,
} from './platform-fee.schema';

const VALID: PlatformFeeFormValue = {
  commissionAmount: 50000,
  taxPercent: 12,
  providerFeePercent: 2.5,
};

function validate(value: PlatformFeeFormValue) {
  return TestBed.runInInjectionContext(() => form(signal(value), platformFeeFormSchema));
}

describe('platformFeeFormSchema', () => {
  it('should accept the form when every value is within its limits', () => {
    expect(validate(VALID)().valid()).toBe(true);
  });

  it('should accept zero values when the fee is switched off', () => {
    const fields = validate({ commissionAmount: 0, taxPercent: 0, providerFeePercent: 0 });

    expect(fields().valid()).toBe(true);
  });

  it('should accept the upper percent limit when the percent is 100', () => {
    const fields = validate({ ...VALID, taxPercent: 100, providerFeePercent: 100 });

    expect(fields().valid()).toBe(true);
  });

  it.each([-1, -0.01, 10.005, 0.001])(
    'should reject the commission %s when it is negative or has more than two decimals',
    (commissionAmount) => {
      const fields = validate({ ...VALID, commissionAmount });

      expect(fields.commissionAmount().invalid()).toBe(true);
      expect(fields.taxPercent().invalid()).toBe(false);
    },
  );

  it.each([-1, 100.01, 101, 12.345])(
    'should reject the tax percent %s when it is out of range or has more than two decimals',
    (taxPercent) => {
      const fields = validate({ ...VALID, taxPercent });

      expect(fields.taxPercent().invalid()).toBe(true);
      expect(fields.providerFeePercent().invalid()).toBe(false);
    },
  );

  it.each([-1, 100.01, 101, 2.555])(
    'should reject the provider percent %s when it is out of range or has more than two decimals',
    (providerFeePercent) => {
      const fields = validate({ ...VALID, providerFeePercent });

      expect(fields.providerFeePercent().invalid()).toBe(true);
      expect(fields.taxPercent().invalid()).toBe(false);
    },
  );

  it('should reject a cleared field when a value is required', () => {
    const fields = validate({ commissionAmount: null, taxPercent: null, providerFeePercent: null });

    expect(fields.commissionAmount().invalid()).toBe(true);
    expect(fields.taxPercent().invalid()).toBe(true);
    expect(fields.providerFeePercent().invalid()).toBe(true);
  });

  it('should explain the limit in the error message of the field', () => {
    const fields = validate({ ...VALID, commissionAmount: -5, taxPercent: 101 });

    expect(
      fields
        .commissionAmount()
        .errors()
        .map((error) => error.message),
    ).toContain('platformFee.errors.commissionAmount');
    expect(
      fields
        .taxPercent()
        .errors()
        .map((error) => error.message),
    ).toContain('platformFee.errors.percent');
  });
});

describe('toPlatformFeeFormValue', () => {
  it('should copy the three editable numbers and drop the currency when the fee is shown', () => {
    const fee: PlatformFee = {
      commissionAmount: 50000,
      taxPercent: 0,
      providerFeePercent: 2,
      currencyCode: 'UZS',
    };

    expect(toPlatformFeeFormValue(fee)).toEqual({
      commissionAmount: 50000,
      taxPercent: 0,
      providerFeePercent: 2,
    });
  });
});

describe('toPlatformFeeDraft', () => {
  it('should return the draft when every field has a value', () => {
    expect(toPlatformFeeDraft(VALID)).toEqual({
      commissionAmount: 50000,
      taxPercent: 12,
      providerFeePercent: 2.5,
    });
  });

  it('should keep a zero when the field is zero and not empty', () => {
    expect(
      toPlatformFeeDraft({ commissionAmount: 0, taxPercent: 0, providerFeePercent: 0 }),
    ).toEqual({ commissionAmount: 0, taxPercent: 0, providerFeePercent: 0 });
  });

  it.each(['commissionAmount', 'taxPercent', 'providerFeePercent'] as const)(
    'should return null when %s is empty',
    (field) => {
      expect(toPlatformFeeDraft({ ...VALID, [field]: null })).toBeNull();
    },
  );
});
