import { min, required, schema } from '@angular/forms/signals';
import { TranslationKey } from '@core/i18n/dictionary';
import { MIN_ORDER_PRICE } from '../../models/payment-order-draft';

const ERRORS = {
  userId: 'paymentOrders.create.errors.userId',
  trainer: 'paymentOrders.create.errors.trainer',
  price: 'paymentOrders.create.errors.price',
} as const satisfies Record<string, TranslationKey>;

export interface PaymentOrderCreateFormValue {
  userId: string | null;
  trainerId: string | null;
  price: number | null;
}

export function emptyCreateFormValue(): PaymentOrderCreateFormValue {
  return { userId: null, trainerId: null, price: null };
}

export const paymentOrderCreateSchema = schema<PaymentOrderCreateFormValue>((path) => {
  required(path.userId, { message: ERRORS.userId });
  required(path.trainerId, { message: ERRORS.trainer });
  required(path.price, { message: ERRORS.price });
  min(path.price, MIN_ORDER_PRICE, { message: ERRORS.price });
});
