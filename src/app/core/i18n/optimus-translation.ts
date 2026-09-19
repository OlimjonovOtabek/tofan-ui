import { effect, inject, Injectable } from '@angular/core';
import { Optimus } from '@openng/optimus-ui/config';
import { LocaleStore } from './locale.store';
import { dictionaryUz } from './translations/uz';
import { dictionaryRu } from './translations/ru';
import { dictionaryEn } from './translations/en';
import { AppLocale } from './locale';

const OPTIMUS_TRANSLATIONS: Record<AppLocale, any> = {
  uz: dictionaryUz.optimus,
  ru: dictionaryRu.optimus,
  en: dictionaryEn.optimus
};

@Injectable({ providedIn: 'root' })
export class OptimusTranslationService {
  private readonly optimus = inject(Optimus);
  private readonly store = inject(LocaleStore);

  constructor() {
    effect(() => {
      const locale = this.store.locale();
      this.optimus.setTranslation(OPTIMUS_TRANSLATIONS[locale]);
    });
  }
}
