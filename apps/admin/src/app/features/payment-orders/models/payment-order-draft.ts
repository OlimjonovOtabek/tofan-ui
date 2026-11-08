import { ValidationError } from '@shared/models/errors/validation.error';
import { isUuid } from '@shared/utils/identifiers';

export const MIN_ORDER_PRICE = 1;

export interface PaymentOrderDraft {
  readonly userId: string;
  readonly trainerId: string;
  readonly price: number;
}

export function createPaymentOrderDraft(draft: PaymentOrderDraft): PaymentOrderDraft {
  const userId = requireUuid(draft.userId, 'UserId.Invalid', 'The user id must be a UUID.');
  const trainerId = requireUuid(
    draft.trainerId,
    'TrainerId.Invalid',
    'The trainer id must be a UUID.',
  );
  if (!Number.isInteger(draft.price) || draft.price < MIN_ORDER_PRICE) {
    throw new ValidationError('The order price is not a positive whole number.', [
      { code: 'PaymentOrder.PriceInvalid', message: 'The price must be a positive whole number.' },
    ]);
  }
  return { userId, trainerId, price: draft.price };
}

function requireUuid(value: string, code: string, message: string): string {
  const trimmed = value.trim();
  if (!isUuid(trimmed)) {
    throw new ValidationError(message, [{ code, message }]);
  }
  return trimmed;
}
