import { Directive, input } from '@angular/core';

export type ButtonType = 'primary' | 'secondary' | 'soft' | 'destructive';
export type ButtonSize = 'large' | 'compact' | 'small';

@Directive({
  selector: '[coachButton]',
  host: {
    class: 'c-button c-pressable',
    '[class]': "'is-' + coachButton() + ' size-' + size()",
    '[class.is-loading]': 'loading()',
    '[attr.aria-busy]': 'loading() || null',
  },
})
export class Button {
  readonly coachButton = input.required<ButtonType>();
  readonly size = input<ButtonSize>('large');
  readonly loading = input(false);
}
