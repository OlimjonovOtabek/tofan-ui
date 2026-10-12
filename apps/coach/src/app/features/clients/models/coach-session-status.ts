import { TranslationKey } from '@core/i18n/dictionary';
import { toSelectOptions } from '@shared/models/select-option';

export const SESSION_STATUSES = ['planned', 'started', 'completed', 'skipped', 'cancelled'] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

export type SessionTone = 'neutral' | 'good' | 'bad';

export const SESSION_STATUS_LABELS: Record<SessionStatus, TranslationKey> = {
  planned: 'coach.clients.status.planned',
  started: 'coach.clients.status.started',
  completed: 'coach.clients.status.completed',
  skipped: 'coach.clients.status.skipped',
  cancelled: 'coach.clients.status.cancelled',
};

export const SESSION_STATUS_OPTIONS = toSelectOptions(SESSION_STATUSES, SESSION_STATUS_LABELS);

const SESSION_TONES: Record<SessionStatus, SessionTone> = {
  planned: 'neutral',
  started: 'neutral',
  completed: 'good',
  skipped: 'bad',
  cancelled: 'bad',
};

export function sessionTone(status: SessionStatus): SessionTone {
  return SESSION_TONES[status];
}
