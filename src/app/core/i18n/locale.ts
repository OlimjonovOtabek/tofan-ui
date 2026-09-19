export const LOCALES = ['uz', 'ru', 'en'] as const;
export type AppLocale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = 'uz';

export const INTL_LOCALE_MAP: Record<AppLocale, string> = {
  uz: 'uz-UZ',
  ru: 'ru-RU',
  en: 'en-GB'
};
