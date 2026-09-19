import { AppLocale, DEFAULT_LOCALE } from '@core/i18n/locale';

export interface LocalizedText {
  readonly en: string;
  readonly uz: string;
  readonly ru: string;
}

export type LocalizedField = 'name' | 'nameUz' | 'nameRu';

const FALLBACK_ORDER: readonly AppLocale[] = [DEFAULT_LOCALE, 'en', 'ru'];

const NAME_FIELDS: Record<AppLocale, LocalizedField> = {
  en: 'name',
  uz: 'nameUz',
  ru: 'nameRu',
};

export function pickLocalized(text: LocalizedText, locale: AppLocale): string {
  const candidates = [locale, ...FALLBACK_ORDER].map((candidate) => text[candidate].trim());
  return candidates.find((value) => value.length > 0) ?? '';
}

export function localizedNameField(locale: AppLocale): LocalizedField {
  return NAME_FIELDS[locale];
}
