import { Component, computed, input } from '@angular/core';

export type ProgressTone = 'primary' | 'info' | 'warning' | 'success' | 'muted';

@Component({
  selector: 'coach-progress',
  template: `<span
    class="fill"
    [class.is-indeterminate]="value() === null"
    [style.width.%]="percent()"
  ></span>`,
  styleUrl: './progress.css',
  host: {
    role: 'progressbar',
    '[attr.aria-valuenow]': 'value() === null ? null : percent()',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    '[class]': "'tone-' + tone()",
    '[style.height.px]': 'height()',
  },
})
export class Progress {
  readonly value = input<number | null>(null);
  readonly tone = input<ProgressTone>('primary');
  readonly height = input(6);

  protected readonly percent = computed(() =>
    Math.round(Math.min(Math.max(this.value() ?? 0.3, 0), 1) * 100),
  );
}
