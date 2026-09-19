import { AppLocale, INTL_LOCALES } from './locale';

export function formatDate(date: Date, locale: AppLocale): string {
  return date.toLocaleDateString(INTL_LOCALES[locale], { dateStyle: 'short' });
}

export function formatCalendarDate(date: Date, locale: AppLocale): string {
  return date.toLocaleDateString(INTL_LOCALES[locale], { dateStyle: 'short', timeZone: 'UTC' });
}

export function formatDateTime(date: Date, locale: AppLocale): string {
  return date.toLocaleString(INTL_LOCALES[locale], { dateStyle: 'short', timeStyle: 'short' });
}
