import { TranslationKey } from '@core/i18n/dictionary';
import { ActivityText } from './client-activity';
import { Client, daysLeft } from './client';
import { daysSinceWorkout } from './client-activity';

export function accessLeftText(client: Client, now: Date): ActivityText {
  if (client.status === 'ended') {
    return { key: 'coachApp.clients.accessExpired' };
  }
  const days = daysLeft(client, now);
  return days === null
    ? { key: 'coachApp.clients.accessUnknown' }
    : { key: 'coachApp.clients.accessLeft', params: { count: days } };
}

export function lastActivityShortText(client: Client, now: Date): ActivityText {
  const days = daysSinceWorkout(client.lastWorkoutOn, now);
  if (days === null) {
    return { key: 'coachApp.activityShort.none' };
  }
  if (days === 0) {
    return { key: 'coachApp.activityShort.today' };
  }
  if (days === 1) {
    return { key: 'coachApp.activityShort.yesterday' };
  }
  return { key: 'coachApp.activityShort.daysAgo', params: { days } };
}

export const CLIENT_FILTER_LABELS: Readonly<Record<string, TranslationKey>> = {
  all: 'coachApp.clients.filterAll',
  active: 'coachApp.clients.filterActive',
  expiring: 'coachApp.clients.filterExpiring',
  lowActivity: 'coachApp.clients.filterLowActivity',
  ended: 'coachApp.clients.filterEnded',
};
