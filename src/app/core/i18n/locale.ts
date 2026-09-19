export const APP_LOCALES = ['uz', 'ru', 'en'] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = 'uz';

export const INTL_LOCALES: Record<AppLocale, string> = {
  uz: 'uz-UZ',
  ru: 'ru-RU',
  en: 'en-GB',
};

export const LOCALE_NAMES: Record<AppLocale, string> = {
  uz: 'Oʻzbekcha',
  ru: 'Русский',
  en: 'English',
};

export function isAppLocale(value: unknown): value is AppLocale {
  return APP_LOCALES.some((locale) => locale === value);
}
