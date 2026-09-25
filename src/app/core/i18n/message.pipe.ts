import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslatableMessage } from './translate';
import { Translator } from './translator';

@Pipe({ name: 'message', pure: false })
export class MessagePipe implements PipeTransform {
  private readonly translator = inject(Translator);

  transform(message: TranslatableMessage): string {
    return this.translator.message(message);
  }
}
