import { AppLocale, INTL_LOCALE_MAP } from './locale';

export function formatDate(date: Date, locale: AppLocale, options?: Intl.DateTimeFormatOptions): string {
  const intlLocale = INTL_LOCALE_MAP[locale];
  return date.toLocaleDateString(intlLocale, {
    dateStyle: 'short',
    ...options
  });
}

export function formatDateTime(date: Date, locale: AppLocale, options?: Intl.DateTimeFormatOptions): string {
  const intlLocale = INTL_LOCALE_MAP[locale];
  
  return date.toLocaleString(intlLocale, {
    dateStyle: 'short',
    timeStyle: 'short',
    ...options
  });
}
