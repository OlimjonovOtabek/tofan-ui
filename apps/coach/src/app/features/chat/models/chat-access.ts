import { DomainError } from '@shared/models/errors/domain.error';

export const SUBSCRIPTION_REQUIRED_CODE = 'Chat.SubscriptionRequired';

export function isSubscriptionRequired(error: unknown): boolean {
  return error instanceof DomainError && error.code === SUBSCRIPTION_REQUIRED_CODE;
}
