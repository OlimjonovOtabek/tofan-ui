import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationKey, TranslationParams } from './dictionary';
import { Translator } from './translator';

@Pipe({ name: 't', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly translator = inject(Translator);

  transform(key: TranslationKey, params?: TranslationParams): string {
    return this.translator.translate(key, params);
  }
}
