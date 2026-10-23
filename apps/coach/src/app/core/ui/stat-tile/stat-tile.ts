import { Component, input } from '@angular/core';
import { Icon } from '../icon/icon';
import { IconName } from '../icon/icon-name';
import { Progress } from '../progress/progress';

export type TileTone = 'primary' | 'info' | 'warning' | 'success' | 'muted';

@Component({
  selector: 'coach-stat-tile',
  imports: [Icon, Progress],
  template: `
    <div class="head">
      <span class="t-base4 font-medium tone-secondary coach-ellipsis">{{ label() }}</span>
      <coach-icon [name]="icon()" [class]="'tone-' + tone()" />
    </div>
    <div class="body">
      <p class="coach-ellipsis">
        <span class="t-display3">{{ value() }}</span>
        @if (unit(); as unit) {
          <span class="t-base3 tone-secondary"> {{ unit }}</span>
        }
      </p>
      @if (goal(); as goal) {
        <p class="goal t-base5 font-medium coach-ellipsis" [class]="'tone-' + goalTone()">
          {{ goal }}
        </p>
      }
      @if (progress() !== null) {
        <coach-progress class="bar" [value]="progress()" [tone]="tone()" />
      }
    </div>
  `,
  styleUrl: './stat-tile.css',
  host: { class: 'c-card' },
})
export class StatTile {
  readonly label = input.required<string>();
  readonly icon = input.required<IconName>();
  readonly tone = input<TileTone>('primary');
  readonly value = input.required<string>();
  readonly unit = input<string | null>(null);
  readonly goal = input<string | null>(null);
  readonly goalTone = input<'secondary' | 'warning'>('secondary');
  readonly progress = input<number | null>(null);
}
