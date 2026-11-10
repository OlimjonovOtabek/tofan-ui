import { chatTime, dayLabel, presenceText, previewText } from './chat-text';

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
  it('should prefer the activity, then online, then last seen', () => {
    const seen = new Date(2026, 9, 22, 8, 30);

    expect(
      presenceText({ activity: 'typing', online: true, lastSeen: seen }, now, 'uz', translate),
    ).toBe('coachApp.conversation.typing');
    expect(
      presenceText(
        { activity: 'recordingVoice', online: true, lastSeen: seen },
        now,
        'uz',
        translate,
      ),
    ).toBe('coachApp.conversation.recordingVoice');
    expect(
      presenceText({ activity: null, online: true, lastSeen: seen }, now, 'uz', translate),
    ).toBe('coachApp.conversation.online');
    expect(
      presenceText({ activity: null, online: false, lastSeen: seen }, now, 'uz', translate),
    ).toBe('coachApp.conversation.lastSeen:08:30');
    expect(
      presenceText({ activity: null, online: false, lastSeen: null }, now, 'uz', translate),
    ).toBeNull();
  });
});

describe('previewText', () => {
  it('should show the caption or file name when the message has text', () => {
    expect(previewText('image', 'Leg day', translate)).toBe('Leg day');
    expect(previewText('file', 'plan.pdf', translate)).toBe('plan.pdf');
  });

  it('should name the kind when a media message has no text', () => {
    expect(previewText('image', '', translate)).toBe('coachApp.chat.lastImage');
    expect(previewText('voice', '', translate)).toBe('coachApp.chat.lastVoice');
    expect(previewText('videoNote', '', translate)).toBe('coachApp.chat.lastVideoNote');
  });

  it('should keep an empty preview when there is no message', () => {
    expect(previewText(null, '', translate)).toBe('');
    expect(previewText('text', '', translate)).toBe('');
  });
});
