import { Component, input, output } from '@angular/core';

@Component({
  selector: 'coach-section-card',
  template: `
    <header>
      <h2 class="t-base1 font-bold coach-ellipsis">{{ title() }}</h2>
      @if (actionLabel(); as label) {
        <button type="button" class="action t-base3 font-semibold" (click)="action.emit()">
          {{ label }}
        </button>
      }
    </header>
    <ng-content />
  `,
  styleUrl: './section-card.css',
  host: { class: 'c-card' },
})
export class SectionCard {
  readonly title = input.required<string>();
  readonly actionLabel = input<string | null>(null);
  readonly action = output<void>();
}
