import { Injectable, inject } from '@angular/core';
import { SelectOption } from '@shared/models/select-option';
import { TranslationKey, TranslationParams } from './dictionary';
import { LocaleStore } from './locale.store';
import { translate, translateMessage } from './translate';

@Injectable({ providedIn: 'root' })
export class Translator {
  private readonly localeStore = inject(LocaleStore);

  translate(key: TranslationKey, params?: TranslationParams): string {
    return translate(this.localeStore.locale(), key, params);
  }

  message(keyOrText: string, params?: TranslationParams): string {
    return translateMessage(this.localeStore.locale(), keyOrText, params);
  }

  options<TValue>(
    options: readonly SelectOption<TValue, TranslationKey>[],
  ): SelectOption<TValue>[] {
    return options.map(({ value, label }) => ({ value, label: this.translate(label) }));
  }
}
