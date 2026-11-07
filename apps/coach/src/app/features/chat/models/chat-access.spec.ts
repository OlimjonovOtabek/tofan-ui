import { AccessDeniedError } from '@shared/models/errors/access-denied.error';
import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { isSubscriptionRequired, unsentText } from './chat-access';

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

describe('unsentText', () => {
  it('should return the draft as typed when the conversation is read-only and the draft has text', () => {
    expect(unsentText('  salom\nDo‘stim ', false)).toBe('  salom\nDo‘stim ');
  });

  it('should be null when the conversation is writable', () => {
    expect(unsentText('salom', true)).toBeNull();
  });

  it('should be null when the conversation is read-only and the draft is empty or only spaces', () => {
    expect(unsentText('', false)).toBeNull();
    expect(unsentText(' \n  ', false)).toBeNull();
  });
});
