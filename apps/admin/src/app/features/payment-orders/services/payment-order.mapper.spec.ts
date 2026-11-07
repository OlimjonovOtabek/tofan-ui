import { TierDto } from '@shared/models/tier.dto';
import {
  PaymentOrderResponse,
  PaymentOrderStatusDto,
  PaymentProviderDto,
  PaymentPurposeDto,
} from './payment-order.dto';
import { toPaymentOrder, toPaymentOrderStatusDto } from './payment-order.mapper';

const subscriptionOrder: PaymentOrderResponse = {
  id: 'o1',
  userId: 'u1',
  purpose: PaymentPurposeDto.TrainerSubscription,
  referenceId: 'trainer-1',
  price: 200000,
  commissionAmount: 50000,
  taxPercent: 12,
  taxAmount: 30000,
  providerFeePercent: 2,
  providerFeeAmount: 5600,
  amount: 285600,
  status: PaymentOrderStatusDto.Paid,
  paidWith: PaymentProviderDto.Click,
  createdOnUtc: '2026-11-06T04:56:59.917Z',
  paidOnUtc: '2026-11-06T05:00:00Z',
  refundedOnUtc: null,
  tier: TierDto.Vip,
};

describe('toPaymentOrder', () => {
  it('should map every amount, the enums and the dates when the order is a paid subscription', () => {
    expect(toPaymentOrder(subscriptionOrder)).toEqual({
      id: 'o1',
      userId: 'u1',
      purpose: 'trainerSubscription',
      referenceId: 'trainer-1',
      tier: 'vip',
      price: 200000,
      commissionAmount: 50000,
      taxPercent: 12,
      taxAmount: 30000,
      providerFeePercent: 2,
      providerFeeAmount: 5600,
      amount: 285600,
      status: 'paid',
      paidWith: 'click',
      createdAt: new Date('2026-11-06T04:56:59.917Z'),
      paidAt: new Date('2026-11-06T05:00:00Z'),
      refundedAt: null,
    });
  });

  it('should drop the tier when the order is for a Tofan tariff', () => {
    const order = toPaymentOrder({
      ...subscriptionOrder,
      purpose: PaymentPurposeDto.Tariff,
      tier: TierDto.Standard,
    });

    expect(order.purpose).toBe('tariff');
    expect(order.tier).toBeNull();
  });

  it('should keep the provider and the dates empty when the order is still pending', () => {
    const order = toPaymentOrder({
      ...subscriptionOrder,
      status: PaymentOrderStatusDto.Pending,
      paidWith: null,
      paidOnUtc: null,
    });

    expect(order.status).toBe('pending');
    expect(order.paidWith).toBeNull();
    expect(order.paidAt).toBeNull();
  });

  it('should read the refund date when the order was refunded', () => {
    const order = toPaymentOrder({
      ...subscriptionOrder,
      status: PaymentOrderStatusDto.Refunded,
      paidWith: PaymentProviderDto.Payme,
      refundedOnUtc: '2026-11-07T10:00:00Z',
    });

    expect(order.status).toBe('refunded');
    expect(order.paidWith).toBe('payme');
    expect(order.refundedAt).toEqual(new Date('2026-11-07T10:00:00Z'));
  });
});

describe('toPaymentOrderStatusDto', () => {
  it('should send the backend number when a status filter is chosen', () => {
    expect(toPaymentOrderStatusDto('pending')).toBe(1);
    expect(toPaymentOrderStatusDto('paid')).toBe(2);
    expect(toPaymentOrderStatusDto('refunded')).toBe(3);
  });
});
