import { PaymentOrderStatus, PaymentProvider, PaymentPurpose } from './payment-order';

export interface PaymentOrderFilter {
  readonly search?: string;
  readonly status?: PaymentOrderStatus;
  readonly purpose?: PaymentPurpose;
  readonly paidWith?: PaymentProvider;
  readonly trainerId?: string;
  readonly createdFrom?: Date;
  readonly createdBefore?: Date;
}

export interface PaymentOrderTarget {
  readonly purpose?: PaymentPurpose;
  readonly referenceId?: string;
}

export function toPaymentOrderTarget(filter: PaymentOrderFilter): PaymentOrderTarget {
  if (filter.trainerId !== undefined) {
    return { purpose: 'trainerSubscription', referenceId: filter.trainerId };
  }
  return filter.purpose === undefined ? {} : { purpose: filter.purpose };
}
