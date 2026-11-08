import { trainerPriceBreakdown } from './trainer-price-breakdown';

describe('trainerPriceBreakdown', () => {
  it('should add the commission and the provider fee when the tax is zero', () => {
    expect(
      trainerPriceBreakdown(200000, {
        commissionAmount: 50000,
        taxPercent: 0,
        providerFeePercent: 2,
      }),
    ).toEqual({ price: 200000, commission: 50000, tax: 0, providerFee: 5000, total: 255000 });
  });

  it('should take the provider fee from the price, commission and tax when the tax is set', () => {
    expect(
      trainerPriceBreakdown(200000, {
        commissionAmount: 50000,
        taxPercent: 12,
        providerFeePercent: 2,
      }),
    ).toEqual({ price: 200000, commission: 50000, tax: 30000, providerFee: 5600, total: 285600 });
  });

  it('should match the backend example when the price is 500 000', () => {
    expect(
      trainerPriceBreakdown(500000, {
        commissionAmount: 50000,
        taxPercent: 0,
        providerFeePercent: 2,
      }).total,
    ).toBe(561000);
  });

  it('should round half a sum up when a step ends in 0.5', () => {
    expect(
      trainerPriceBreakdown(25, { commissionAmount: 0, taxPercent: 0, providerFeePercent: 2 }),
    ).toMatchObject({ providerFee: 1, total: 26 });
  });

  it('should round half a sum up when the percent has no exact binary form', () => {
    expect(
      trainerPriceBreakdown(375, { commissionAmount: 0, taxPercent: 9.2, providerFeePercent: 0 }),
    ).toMatchObject({ tax: 35, total: 410 });
  });

  it('should keep the commission cents in the total when the commission has decimals', () => {
    expect(
      trainerPriceBreakdown(200000, {
        commissionAmount: 0.1,
        taxPercent: 0,
        providerFeePercent: 0,
      }).total,
    ).toBe(200000.1);
  });
});
