import { Component, input, output } from '@angular/core';
import { Icon } from '../icon/icon';

@Component({
  selector: 'coach-option-tile',
  imports: [Icon],
  template: `
    <button
      type="button"
      class="tile c-pressable"
      [class.is-selected]="selected()"
      [attr.aria-pressed]="selected()"
      (click)="pick.emit()"
    >
      <ng-content select="[leading]" />
      <span class="text">
        <span class="t-base1 font-semibold">{{ title() }}</span>
        @if (subtitle(); as subtitle) {
          <span class="t-base3 tone-secondary">{{ subtitle }}</span>
        }
      </span>
      <span class="indicator" [class.is-on]="selected()">
        @if (selected()) {
          <coach-icon name="check" />
        }
      </span>
    </button>
    <ng-content />
  `,
  styleUrl: './option-tile.css',
})
export class OptionTile {
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly selected = input(false);
  readonly pick = output<void>();
}
