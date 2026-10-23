import { chatTime, dayLabel, presenceText } from './chat-text';

const translate = (key: string, params?: Record<string, string | number>) =>
  params === undefined ? key : `${key}:${Object.values(params)}`;
const now = new Date(2026, 9, 22, 15, 0);

describe('chatTime', () => {
  it('should show the clock today, yesterday as a word, weekdays within a week and a date after', () => {
    expect(chatTime(new Date(2026, 9, 22, 9, 5), now, 'uz', translate)).toBe('09:05');
    expect(chatTime(new Date(2026, 9, 21, 9, 5), now, 'uz', translate)).toBe(
      'coachApp.chat.yesterday',
    );
    expect(chatTime(new Date(2026, 9, 19, 9, 5), now, 'uz', translate)).toBe('Dush');
    expect(chatTime(new Date(2026, 9, 1, 9, 5), now, 'uz', translate)).toBe('1 okt');
  });
});

describe('dayLabel', () => {
  it('should add the year only for another year', () => {
    expect(dayLabel(new Date(2026, 8, 3), now, 'uz', translate)).toBe('3 sentabr');
    expect(dayLabel(new Date(2025, 8, 3), now, 'uz', translate)).toBe('3 sentabr 2025');
  });
});

describe('presenceText', () => {
  it('should prefer typing, then online, then last seen', () => {
    const seen = new Date(2026, 9, 22, 8, 30);

    expect(presenceText({ typing: true, online: true, lastSeen: seen }, now, 'uz', translate)).toBe(
      'coachApp.conversation.typing',
    );
    expect(
      presenceText({ typing: false, online: true, lastSeen: seen }, now, 'uz', translate),
    ).toBe('coachApp.conversation.online');
    expect(
      presenceText({ typing: false, online: false, lastSeen: seen }, now, 'uz', translate),
    ).toBe('coachApp.conversation.lastSeen:08:30');
    expect(
      presenceText({ typing: false, online: false, lastSeen: null }, now, 'uz', translate),
    ).toBeNull();
  });
});
