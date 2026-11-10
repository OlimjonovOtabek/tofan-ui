import { TranslationKey } from '@core/i18n/dictionary';
import { toSelectOptions } from '@shared/models/select-option';
import { SessionDeviceKind } from './session-device';
import { UserSessionStatus } from './user-session';
import { SESSION_STATUS_FILTERS, SessionStatusFilter } from './user-session-filter';

export type SessionTagSeverity = 'info' | 'secondary' | 'warn';

export const SESSION_STATUS_LABELS: Record<UserSessionStatus, TranslationKey> = {
  unexpired: 'userSessions.status.unexpired',
  expired: 'userSessions.status.expired',
  revokedEverywhere: 'userSessions.status.revokedEverywhere',
};

export const SESSION_STATUS_SEVERITIES: Record<UserSessionStatus, SessionTagSeverity> = {
  unexpired: 'info',
  expired: 'secondary',
  revokedEverywhere: 'warn',
};

export const SESSION_STATUS_FILTER_LABELS: Record<SessionStatusFilter, TranslationKey> = {
  active: 'userSessions.status.unexpired',
  revoked: 'userSessions.status.revokedEverywhere',
  expired: 'userSessions.status.expired',
};

export const SESSION_STATUS_FILTER_OPTIONS = toSelectOptions(
  SESSION_STATUS_FILTERS,
  SESSION_STATUS_FILTER_LABELS,
);

export const SESSION_DEVICE_FALLBACK_LABELS: Record<SessionDeviceKind, TranslationKey> = {
  app: 'userSessions.device.app',
  browser: 'userSessions.device.browser',
  other: 'userSessions.device.other',
  unknown: 'userSessions.device.unknown',
};
