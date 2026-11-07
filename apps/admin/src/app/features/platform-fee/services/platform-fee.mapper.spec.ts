import { PlatformFeeResponse } from './platform-fee.dto';
import { toChangePlatformFeeRequest, toPlatformFee } from './platform-fee.mapper';

describe('toPlatformFee', () => {
  it('should map every backend field when the response is complete', () => {
    const response: PlatformFeeResponse = {
      commissionAmount: 50000,
      taxPercent: 12,
      providerFeePercent: 2.5,
      currencyCode: 'UZS',
    };

    expect(toPlatformFee(response)).toEqual({
      commissionAmount: 50000,
      taxPercent: 12,
      providerFeePercent: 2.5,
      currencyCode: 'UZS',
    });
  });

  it('should keep zero values when the fee is switched off', () => {
    const response: PlatformFeeResponse = {
      commissionAmount: 0,
      taxPercent: 0,
      providerFeePercent: 0,
      currencyCode: 'UZS',
    };

    expect(toPlatformFee(response)).toEqual(response);
  });
});

describe('toChangePlatformFeeRequest', () => {
  it('should send exactly the three editable numbers when the draft is saved', () => {
    expect(
      toChangePlatformFeeRequest({
        commissionAmount: 1500.5,
        taxPercent: 0,
        providerFeePercent: 2,
      }),
    ).toEqual({ commissionAmount: 1500.5, taxPercent: 0, providerFeePercent: 2 });
  });
});
