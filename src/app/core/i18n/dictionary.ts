import { DICTIONARY_UZ } from './translations/uz';

export type Dictionary = typeof DICTIONARY_UZ;

type KeysOf<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${KeysOf<T[K]>}`;
}[keyof T & string];

export type TranslationKey = KeysOf<Dictionary>;

export type TranslationParams = Readonly<Record<string, string | number>>;
