import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Button } from '../button/button';
import { Icon } from '../icon/icon';
import { IconName } from '../icon/icon-name';

@Component({
  selector: 'coach-empty-state',
  imports: [Icon, Button, TranslatePipe],
  template: `
    <coach-icon [name]="icon()" />
    <h3 class="t-title3">{{ title() }}</h3>
    <p class="t-base5 tone-secondary">{{ message() }}</p>
    @if (retryable()) {
      <button coachButton="secondary" type="button" class="retry" (click)="retry.emit()">
        {{ 'coachApp.common.retry' | t }}
      </button>
    }
  `,
  styleUrl: './empty-state.css',
  host: { class: 'c-card' },
})
export class EmptyState {
  readonly icon = input<IconName>('utensils');
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly retryable = input(false);
  readonly retry = output<void>();
}
