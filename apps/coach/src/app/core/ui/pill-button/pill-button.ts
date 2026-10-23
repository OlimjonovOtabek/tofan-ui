import { Directive, input } from '@angular/core';

export type PillType = 'neutral' | 'soft' | 'solid';

@Directive({
  selector: '[coachPill]',
  host: {
    class: 'c-pill c-pressable',
    '[class]': "'is-' + coachPill()",
    '[class.is-loading]': 'loading()',
    '[attr.aria-busy]': 'loading() || null',
  },
})
export class PillButton {
  readonly coachPill = input<PillType>('neutral');
  readonly loading = input(false);
}
