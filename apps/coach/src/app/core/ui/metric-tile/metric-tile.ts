import { Component, input } from '@angular/core';

export type MetricTone = 'primary' | 'secondary' | 'info' | 'warning' | 'success';

@Component({
  selector: 'coach-metric-tile',
  template: `
    <span class="t-base4 tone-secondary coach-ellipsis">{{ label() }}</span>
    <p class="value coach-ellipsis" [class]="'tone-' + valueTone()">
      <span [class]="size() === 'large' ? 't-display3' : 't-title4'">{{ value() }}</span>
      @if (unit(); as unit) {
        <span class="t-base5 font-medium" [class.tone-secondary]="valueTone() === 'primary'">
          {{ unit }}</span
        >
      }
    </p>
    @if (caption(); as caption) {
      <span class="t-base5 coach-ellipsis" [class]="'tone-' + captionTone()">{{ caption }}</span>
    }
  `,
  styleUrl: './metric-tile.css',
  host: { '[class.is-boxed]': "type() === 'boxed'" },
})
export class MetricTile {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly unit = input<string | null>(null);
  readonly caption = input<string | null>(null);
  readonly valueTone = input<MetricTone>('primary');
  readonly captionTone = input<MetricTone>('secondary');
  readonly type = input<'boxed' | 'plain'>('boxed');
  readonly size = input<'large' | 'medium'>('large');
}
