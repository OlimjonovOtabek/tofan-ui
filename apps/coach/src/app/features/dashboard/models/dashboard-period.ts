import { TranslationKey } from '@core/i18n/dictionary';

export const DASHBOARD_PERIODS = ['today', 'week', 'month', 'year'] as const;

export type DashboardPeriod = (typeof DASHBOARD_PERIODS)[number];

export const DASHBOARD_PERIOD_LABELS: Record<DashboardPeriod, TranslationKey> = {
  today: 'coachApp.dashboard.period.today',
  week: 'coachApp.dashboard.period.week',
  month: 'coachApp.dashboard.period.month',
  year: 'coachApp.dashboard.period.year',
};
