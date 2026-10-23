import { Component, input, output } from '@angular/core';

@Component({
  selector: 'coach-section-header',
  template: `
    <h2 class="t-title3">{{ title() }}</h2>
    <ng-content />
    @if (actionLabel(); as label) {
      <button type="button" class="action t-base3 font-semibold" (click)="action.emit()">
        {{ label }}
      </button>
    }
  `,
  styleUrl: './section-header.css',
})
export class SectionHeader {
  readonly title = input.required<string>();
  readonly actionLabel = input<string | null>(null);
  readonly action = output<void>();
}
