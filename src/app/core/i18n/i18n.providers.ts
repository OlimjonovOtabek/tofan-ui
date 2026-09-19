import { EnvironmentProviders, effect, inject, provideEnvironmentInitializer } from '@angular/core';
import { Optimus } from '@openng/optimus-ui/config';
import { Translation } from '@openng/optimus-ui/api';
import { AppLocale } from './locale';
import { LocaleStore } from './locale.store';
import { OPTIMUS_EN } from './optimus/en';
import { OPTIMUS_RU } from './optimus/ru';
import { OPTIMUS_UZ } from './optimus/uz';

const OPTIMUS_TRANSLATIONS: Record<AppLocale, Translation> = {
  uz: OPTIMUS_UZ,
  ru: OPTIMUS_RU,
  en: OPTIMUS_EN,
};

export function provideI18n(): EnvironmentProviders {
  return provideEnvironmentInitializer(() => {
    const optimus = inject(Optimus);
    const localeStore = inject(LocaleStore);
    effect(() => optimus.setTranslation(OPTIMUS_TRANSLATIONS[localeStore.locale()]));
  });
}
