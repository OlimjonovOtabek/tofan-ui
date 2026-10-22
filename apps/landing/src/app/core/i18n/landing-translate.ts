import { TranslationParams } from '@core/i18n/dictionary';
import { AppLocale, DEFAULT_LOCALE } from '@core/i18n/locale';
import { interpolate, lookupText } from '@core/i18n/translation-lookup';
import { LandingDictionary, LandingKey } from './landing-dictionary';
import { LANDING_EN } from './translations/en';
import { LANDING_RU } from './translations/ru';
import { LANDING_UZ } from './translations/uz';

const DICTIONARIES: Record<AppLocale, LandingDictionary> = {
  uz: LANDING_UZ,
  ru: LANDING_RU,
  en: LANDING_EN,
};

export function translateLanding(
  locale: AppLocale,
  key: LandingKey,
  params?: TranslationParams,
): string {
  const text =
    lookupText(DICTIONARIES[locale], key) ?? lookupText(DICTIONARIES[DEFAULT_LOCALE], key);
  if (text === undefined) {
    return key;
  }
  return params === undefined ? text : interpolate(text, params);
}
