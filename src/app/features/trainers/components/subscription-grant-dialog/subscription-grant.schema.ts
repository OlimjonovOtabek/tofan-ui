import { TranslationKey } from '@core/i18n/dictionary';
import { max, min, pattern, required, schema } from '@angular/forms/signals';
import { UUID_PATTERN } from '@shared/utils/identifiers';
import { MAX_SUBSCRIPTION_MONTHS, MIN_SUBSCRIPTION_MONTHS } from '../../models/subscription-grant';

const ERRORS = {
  trainer: 'trainers.grant.errors.trainer',
  userId: 'trainers.grant.errors.userId',
  required: 'trainers.grant.errors.required',
  min: 'trainers.grant.errors.min',
  max: 'trainers.grant.errors.max',
} as const satisfies Record<string, TranslationKey>;

export interface SubscriptionGrantFormValue {
  trainerId: string | null;
  userId: string;
  months: number | null;
}

export function emptyGrantFormValue(trainerId: string | null): SubscriptionGrantFormValue {
  return { trainerId, userId: '', months: MIN_SUBSCRIPTION_MONTHS };
}

export const subscriptionGrantSchema = schema<SubscriptionGrantFormValue>((path) => {
  required(path.trainerId, { message: ERRORS.trainer });
  required(path.userId, { message: ERRORS.userId });
  pattern(path.userId, UUID_PATTERN, { message: ERRORS.userId });
  required(path.months, { message: ERRORS.required });
  min(path.months, MIN_SUBSCRIPTION_MONTHS, { message: ERRORS.min });
  max(path.months, MAX_SUBSCRIPTION_MONTHS, { message: ERRORS.max });
});
