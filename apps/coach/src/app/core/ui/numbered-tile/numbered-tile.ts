import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Icon } from '../icon/icon';

@Component({
  selector: 'coach-numbered-tile',
  imports: [Icon, TranslatePipe],
  template: `
    <button type="button" class="main c-row-button" [disabled]="disabled()" (click)="open.emit()">
      <span class="number t-base1 font-bold">{{ number() }}</span>
      <span class="text">
        <span class="t-title4 coach-ellipsis">{{ title() }}</span>
        @if (subtitle(); as subtitle) {
          <span class="t-base4 tone-secondary coach-ellipsis">{{ subtitle }}</span>
        }
      </span>
      <ng-content />
    </button>
    @if (hasMore()) {
      <button
        type="button"
        class="more"
        [disabled]="disabled()"
        [attr.aria-label]="'coachApp.common.more' | t"
        (click)="more.emit()"
      >
        <coach-icon name="more-horizontal" />
      </button>
    }
  `,
  styleUrl: './numbered-tile.css',
  host: { class: 'c-pressable' },
})
export class NumberedTile {
  readonly number = input.required<number>();
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly hasMore = input(false);
  readonly disabled = input(false);
  readonly open = output<void>();
  readonly more = output<void>();
}
