import { AccessDeniedError } from '@shared/models/errors/access-denied.error';
import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { isSubscriptionRequired } from './chat-access';

describe('isSubscriptionRequired', () => {
  it('should be true when the backend refuses the chat for the subscription tier', () => {
    expect(
      isSubscriptionRequired(new AccessDeniedError('refused', 'Chat.SubscriptionRequired')),
    ).toBe(true);
  });

  it('should be false when the refusal carries another code', () => {
    expect(isSubscriptionRequired(new AccessDeniedError('refused'))).toBe(false);
    expect(isSubscriptionRequired(new BusinessRuleError('locked', 'Plan.Locked'))).toBe(false);
  });

  it('should be false when the failure is not a domain error', () => {
    expect(isSubscriptionRequired(new Error('Chat.SubscriptionRequired'))).toBe(false);
    expect(isSubscriptionRequired(null)).toBe(false);
  });
});
