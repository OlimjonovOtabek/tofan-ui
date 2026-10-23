import { Directive } from '@angular/core';

@Directive({
  selector: '[coachTextButton]',
  host: { class: 'c-text-button' },
})
export class TextButton {}
