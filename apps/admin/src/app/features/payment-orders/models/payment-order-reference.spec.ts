import { toPaymentOrderReference } from './payment-order-reference';

const REFERENCE_ID = '452bcf11-d084-4224-a4d2-54a589dfc707';

describe('toPaymentOrderReference', () => {
  it('should show the trainer name when the order is a trainer subscription', () => {
    expect(
      toPaymentOrderReference({
        purpose: 'trainerSubscription',
        referenceId: REFERENCE_ID,
        referenceName: 'Stage Coach',
      }),
    ).toEqual({ text: 'Stage Coach', isId: false });
  });

  it('should show nothing more when the order is a tariff that already names its kind', () => {
    expect(
      toPaymentOrderReference({
        purpose: 'tariff',
        referenceId: REFERENCE_ID,
        referenceName: 'Standard',
      }),
    ).toBeNull();
  });

  it('should fall back to the short id when the reference has no name', () => {
    expect(
      toPaymentOrderReference({
        purpose: 'trainerSubscription',
        referenceId: REFERENCE_ID,
        referenceName: null,
      }),
    ).toEqual({ text: '452bcf11', isId: true });
  });
});
