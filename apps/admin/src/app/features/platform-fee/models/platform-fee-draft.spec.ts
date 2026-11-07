import { ValidationError } from '@shared/models/errors/validation.error';
import { PlatformFeeDraft, createPlatformFeeDraft } from './platform-fee-draft';

const draft: PlatformFeeDraft = {
  commissionAmount: 60000.5,
  taxPercent: 12,
  providerFeePercent: 2.5,
};

function issueCodes(action: () => unknown): string[] {
  try {
    action();
  } catch (error) {
    expect(error).toBeInstanceOf(ValidationError);
    return (error as ValidationError).issues.map((issue) => issue.code);
  }
  throw new Error('The draft was accepted.');
}

describe('createPlatformFeeDraft', () => {
  it('should keep the draft when every number is within its rules', () => {
    expect(createPlatformFeeDraft(draft)).toEqual(draft);
  });

  it('should keep the draft when the numbers sit on the limits', () => {
    const edges: PlatformFeeDraft = { commissionAmount: 0, taxPercent: 100, providerFeePercent: 0 };

    expect(createPlatformFeeDraft(edges)).toEqual(edges);
  });

  it('should refuse the draft when the commission amount is negative', () => {
    expect(issueCodes(() => createPlatformFeeDraft({ ...draft, commissionAmount: -1 }))).toEqual([
      'CommissionAmount.Invalid',
    ]);
  });

  it('should refuse the draft when a number has more than two decimals', () => {
    expect(
      issueCodes(() => createPlatformFeeDraft({ ...draft, commissionAmount: 12.255 })),
    ).toEqual(['CommissionAmount.Invalid']);
    expect(issueCodes(() => createPlatformFeeDraft({ ...draft, taxPercent: 7.123 }))).toEqual([
      'TaxPercent.Invalid',
    ]);
  });

  it('should refuse the draft when a percent is above 100 or below 0', () => {
    expect(issueCodes(() => createPlatformFeeDraft({ ...draft, taxPercent: 101 }))).toEqual([
      'TaxPercent.Invalid',
    ]);
    expect(
      issueCodes(() => createPlatformFeeDraft({ ...draft, providerFeePercent: -0.01 })),
    ).toEqual(['ProviderFeePercent.Invalid']);
  });

  it('should report every broken number when several are invalid', () => {
    const broken: PlatformFeeDraft = {
      commissionAmount: Number.NaN,
      taxPercent: 150,
      providerFeePercent: Number.POSITIVE_INFINITY,
    };

    expect(issueCodes(() => createPlatformFeeDraft(broken))).toEqual([
      'CommissionAmount.Invalid',
      'TaxPercent.Invalid',
      'ProviderFeePercent.Invalid',
    ]);
  });
});
