import { shortId } from '@shared/utils/identifiers';
import { PaymentOrder } from './payment-order';

export interface PaymentOrderReference {
  readonly text: string;
  readonly isId: boolean;
}

export function toPaymentOrderReference(
  order: Pick<PaymentOrder, 'purpose' | 'referenceId' | 'referenceName'>,
): PaymentOrderReference | null {
  if (order.referenceName === null) {
    return { text: shortId(order.referenceId), isId: true };
  }
  return order.purpose === 'tariff' ? null : { text: order.referenceName, isId: false };
}
