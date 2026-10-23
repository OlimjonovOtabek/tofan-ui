import { DICTIONARY_UZ } from './translations/uz';

export type Dictionary = typeof DICTIONARY_UZ;

export type DictionaryKeys<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${DictionaryKeys<T[K]>}`;
}[keyof T & string];

export type TranslationKey = DictionaryKeys<Dictionary>;

export type TranslationParams = Readonly<Record<string, string | number>>;
