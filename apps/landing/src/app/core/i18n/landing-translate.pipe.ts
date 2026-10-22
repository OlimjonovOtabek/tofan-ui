import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationParams } from '@core/i18n/dictionary';
import { LocaleStore } from '@core/i18n/locale.store';
import { LandingKey } from './landing-dictionary';
import { translateLanding } from './landing-translate';

@Pipe({ name: 't', pure: false })
export class LandingTranslatePipe implements PipeTransform {
  private readonly localeStore = inject(LocaleStore);

  transform(key: LandingKey, params?: TranslationParams): string {
    return translateLanding(this.localeStore.locale(), key, params);
  }
}
