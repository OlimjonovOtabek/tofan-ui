import { LocalizedText, pickLocalized } from '@shared/models/localized-text';
import { Dictionary, TranslationKey, TranslationParams } from './dictionary';
import { AppLocale, DEFAULT_LOCALE } from './locale';
import { interpolate, lookupText } from './translation-lookup';
import { DICTIONARY_EN } from './translations/en';
import { DICTIONARY_RU } from './translations/ru';
import { DICTIONARY_UZ } from './translations/uz';

export type TranslatableMessage = string | LocalizedText;

const DICTIONARIES: Record<AppLocale, Dictionary> = {
  uz: DICTIONARY_UZ,
  ru: DICTIONARY_RU,
  en: DICTIONARY_EN,
};

export function translate(
  locale: AppLocale,
  key: TranslationKey,
  params?: TranslationParams,
): string {
  return textOf(locale, key, params) ?? key;
}

export function translateMessage(
  locale: AppLocale,
  message: TranslatableMessage,
  params?: TranslationParams,
): string {
  if (typeof message !== 'string') {
    return pickLocalized(message, locale);
  }
  return textOf(locale, message, params) ?? message;
}

function textOf(locale: AppLocale, key: string, params?: TranslationParams): string | undefined {
  const text =
    lookupText(DICTIONARIES[locale], key) ?? lookupText(DICTIONARIES[DEFAULT_LOCALE], key);
  if (text === undefined || params === undefined) {
    return text;
  }
  return interpolate(text, params);
}
