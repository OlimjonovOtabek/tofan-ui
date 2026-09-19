import { Pipe, PipeTransform, inject } from '@angular/core';
import { Translator } from './translator';
import { TranslationKey, TranslationParams } from './dictionary';

@Pipe({
  name: 't',
  pure: false
})
export class TranslatePipe implements PipeTransform {
  private readonly translator = inject(Translator);

  transform(key: TranslationKey | string, params?: TranslationParams): string {
    return this.translator.translate(key, params);
  }
}
