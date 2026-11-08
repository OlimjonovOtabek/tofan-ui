import { Tier } from '@shared/models/tier';

export const PAYMENT_ORDER_STATUSES = ['pending', 'paid', 'refunded'] as const;
export type PaymentOrderStatus = (typeof PAYMENT_ORDER_STATUSES)[number];

export type PaymentPurpose = 'trainerSubscription' | 'tariff';

export type PaymentProvider = 'payme' | 'click';

export interface PaymentOrder {
  readonly id: string;
  readonly userId: string;
  readonly purpose: PaymentPurpose;
  readonly referenceId: string;
  readonly tier: Tier | null;
  readonly price: number;
  readonly commissionAmount: number;
  readonly taxPercent: number;
  readonly taxAmount: number;
  readonly providerFeePercent: number;
  readonly providerFeeAmount: number;
  readonly amount: number;
  readonly status: PaymentOrderStatus;
  readonly paidWith: PaymentProvider | null;
  readonly createdAt: Date;
  readonly paidAt: Date | null;
  readonly refundedAt: Date | null;
}
