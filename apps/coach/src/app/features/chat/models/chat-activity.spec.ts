import { shouldSendActivity } from './chat-activity';

describe('shouldSendActivity', () => {
  it('should send at most once per three seconds for the same activity', () => {
    expect(shouldSendActivity(undefined, 'typing', 0)).toBe(true);
    expect(shouldSendActivity({ activity: 'typing', at: 0 }, 'typing', 2999)).toBe(false);
    expect(shouldSendActivity({ activity: 'typing', at: 0 }, 'typing', 3000)).toBe(true);
  });

  it('should send at once when the activity changes', () => {
    expect(shouldSendActivity({ activity: 'typing', at: 0 }, 'recordingVoice', 100)).toBe(true);
  });
});
