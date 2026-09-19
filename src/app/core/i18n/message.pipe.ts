import { Pipe, PipeTransform, inject } from '@angular/core';
import { Translator } from './translator';

@Pipe({ name: 'message', pure: false })
export class MessagePipe implements PipeTransform {
  private readonly translator = inject(Translator);

  transform(keyOrText: string): string {
    return this.translator.message(keyOrText);
  }
}
