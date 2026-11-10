import { toPaymentOrderTarget } from './payment-order-filter';

const TRAINER_ID = '0b7c9a52-1111-4222-8333-444455556666';

describe('toPaymentOrderTarget', () => {
  it('should ask for nothing when neither a purpose nor a trainer is chosen', () => {
    expect(toPaymentOrderTarget({})).toEqual({});
  });

  it('should keep the purpose when only a purpose is chosen', () => {
    expect(toPaymentOrderTarget({ purpose: 'tariff' })).toEqual({ purpose: 'tariff' });
  });

  it('should send the trainer as a trainer subscription reference when a trainer is chosen', () => {
    expect(toPaymentOrderTarget({ trainerId: TRAINER_ID })).toEqual({
      purpose: 'trainerSubscription',
      referenceId: TRAINER_ID,
    });
  });

  it('should let the trainer win when a tariff purpose is chosen with a trainer', () => {
    expect(toPaymentOrderTarget({ purpose: 'tariff', trainerId: TRAINER_ID })).toEqual({
      purpose: 'trainerSubscription',
      referenceId: TRAINER_ID,
    });
  });
});
