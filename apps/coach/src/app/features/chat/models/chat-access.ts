import { DomainError } from '@shared/models/errors/domain.error';

export const SUBSCRIPTION_REQUIRED_CODE = 'Chat.SubscriptionRequired';

export function isSubscriptionRequired(error: unknown): boolean {
  return error instanceof DomainError && error.code === SUBSCRIPTION_REQUIRED_CODE;
}

export function unsentText(draft: string, canWrite: boolean): string | null {
  if (canWrite || draft.trim() === '') {
    return null;
  }
  return draft;
}
