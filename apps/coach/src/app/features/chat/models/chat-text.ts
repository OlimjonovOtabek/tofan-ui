import { AppLocale } from '@core/i18n/locale';
import { TranslationKey, TranslationParams } from '@core/i18n/dictionary';
import {
  daysBetween,
  formatDayMonth,
  formatDayMonthLong,
  formatDayMonthTime,
  formatTime,
  formatWeekdayShort,
} from '@coach/core/format/formats';
import { ChatActivity } from './chat-activity';
import { MessageKind } from './chat-attachment';

export type Translate = (key: TranslationKey, params?: TranslationParams) => string;

export const ACTIVITY_LABELS: Readonly<Record<ChatActivity, TranslationKey>> = {
  typing: 'coachApp.conversation.typing',
  recordingVoice: 'coachApp.conversation.recordingVoice',
  recordingVideo: 'coachApp.conversation.recordingVideo',
  uploading: 'coachApp.conversation.uploading',
};

const KIND_PREVIEWS: Readonly<Record<MessageKind, TranslationKey | null>> = {
  text: null,
  image: 'coachApp.chat.lastImage',
  file: 'coachApp.chat.lastFile',
  voice: 'coachApp.chat.lastVoice',
  videoNote: 'coachApp.chat.lastVideoNote',
};

export interface PresenceState {
  readonly activity: ChatActivity | null;
  readonly online: boolean;
  readonly lastSeen: Date | null;
}

export function chatTime(sent: Date, now: Date, locale: AppLocale, translate: Translate): string {
  const days = daysBetween(sent, now);
  if (days <= 0) {
    return formatTime(sent);
  }
  if (days === 1) {
    return translate('coachApp.chat.yesterday');
  }
  return days < 7 ? formatWeekdayShort(sent, locale) : formatDayMonth(sent, locale);
}

export function dayLabel(sent: Date, now: Date, locale: AppLocale, translate: Translate): string {
  const days = daysBetween(sent, now);
  if (days <= 0) {
    return translate('coachApp.conversation.today');
  }
  if (days === 1) {
    return translate('coachApp.chat.yesterday');
  }
  return formatDayMonthLong(sent, locale, sent.getFullYear() !== now.getFullYear());
}

export function presenceText(
  state: PresenceState,
  now: Date,
  locale: AppLocale,
  translate: Translate,
): string | null {
  if (state.activity !== null) {
    return translate(ACTIVITY_LABELS[state.activity]);
  }
  if (state.online) {
    return translate('coachApp.conversation.online');
  }
  if (state.lastSeen === null) {
    return null;
  }
  const sameDay = daysBetween(state.lastSeen, now) === 0;
  const time = sameDay ? formatTime(state.lastSeen) : formatDayMonthTime(state.lastSeen, locale);
  return translate('coachApp.conversation.lastSeen', { time });
}

export function previewText(kind: MessageKind | null, text: string, translate: Translate): string {
  const fallback = kind === null ? null : KIND_PREVIEWS[kind];
  if (text !== '' || fallback === null) {
    return text;
  }
  return translate(fallback);
}
