import { Component, input, output } from '@angular/core';
import { Button } from '@coach/core/ui/button/button';
import { Icon } from '@coach/core/ui/icon/icon';
import { IconName } from '@coach/core/ui/icon/icon-name';

@Component({
  selector: 'coach-status-page',
  imports: [Button, Icon],
  template: `
    <main class="c-card panel">
      <span class="badge"><coach-icon [name]="icon()" /></span>
      <h1 class="t-title2">{{ title() }}</h1>
      <p class="t-base3 tone-secondary">{{ message() }}</p>
      <button coachButton="primary" type="button" (click)="action.emit()">
        {{ actionLabel() }}
      </button>
    </main>
  `,
  styles: `
    :host {
      display: grid;
      place-items: center;
      min-height: 100dvh;
      padding: 24px;
    }
    .panel {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      width: 100%;
      max-width: 440px;
      padding: 24px;
      text-align: center;
    }
    .badge {
      display: grid;
      place-items: center;
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: var(--c-primary-soft);
      color: var(--c-primary);
      --icon-size: 28px;
    }
    button {
      width: 100%;
      margin-top: 12px;
    }
  `,
})
export class StatusPage {
  readonly icon = input.required<IconName>();
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly actionLabel = input.required<string>();
  readonly action = output<void>();
}
