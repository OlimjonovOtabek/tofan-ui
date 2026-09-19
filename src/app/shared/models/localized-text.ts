import { AppLocale } from '@core/i18n/locale';

export interface LocalizedText {
  en: string;
  uz: string;
  ru: string;
}

export function pickLocalized(text: LocalizedText | undefined | null, locale: AppLocale): string {
  if (!text) return '';
  if (text[locale]) return text[locale];
  if (text.uz) return text.uz;
  if (text.en) return text.en;
  if (text.ru) return text.ru;
  
  return '';
}

export function localizedSortField(locale: AppLocale): string {
  switch (locale) {
    case 'ru': return 'nameRu';
    case 'en': return 'name';
    case 'uz':
    default: return 'nameUz';
  }
}
