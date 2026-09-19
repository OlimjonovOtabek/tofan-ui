import { computed, inject, Injectable } from '@angular/core';
import { LocaleStore } from './locale.store';
import { TranslationKey, TranslationParams, Dictionary } from './dictionary';
import { dictionaryUz } from './translations/uz';
import { dictionaryRu } from './translations/ru';
import { dictionaryEn } from './translations/en';

const DICTIONARIES = {
  uz: dictionaryUz,
  ru: dictionaryRu,
  en: dictionaryEn
};

@Injectable({ providedIn: 'root' })
export class Translator {
  private readonly store = inject(LocaleStore);

  translate(key: TranslationKey | string, params?: TranslationParams): string {
    const locale = this.store.locale();
    
    let text = this.getValue(DICTIONARIES[locale], key);
    if (text === undefined && locale !== 'uz') {
      text = this.getValue(DICTIONARIES['uz'], key);
    }
    if (text === undefined) {
      return key;
    }
    
    if (params) {
      return Object.keys(params).reduce(
        (str, p) => str.replace(new RegExp(`\\{${p}\\}`, 'g'), String(params[p])),
        text
      );
    }
    
    return text;
  }

  private getValue(dict: Dictionary, key: string): string | undefined {
    const parts = key.split('.');
    let current: any = dict;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    return typeof current === 'string' ? current : undefined;
  }
}
