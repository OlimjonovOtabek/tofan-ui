import { PaymentOrderStatus } from './payment-order';

export interface PaymentOrderFilter {
  readonly status?: PaymentOrderStatus;
  readonly userId?: string;
  readonly referenceId?: string;
}
