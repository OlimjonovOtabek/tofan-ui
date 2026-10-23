import { Component, input, model } from '@angular/core';

export interface Choice<T> {
  readonly value: T;
  readonly label: string;
  readonly enabled?: boolean;
}

@Component({
  selector: 'coach-choice-chips',
  template: `
    <div
      class="c-chips"
      [class.c-chips--scroll]="scroll()"
      role="radiogroup"
      [attr.aria-label]="ariaLabel()"
    >
      @for (choice of choices(); track choice.value) {
        @let isSelected = choice.value === selected();
        <button
          type="button"
          role="radio"
          class="c-chip"
          [class.is-selected]="isSelected"
          [attr.aria-checked]="isSelected"
          [disabled]="!isSelected && choice.enabled === false"
          (click)="selected.set(choice.value)"
        >
          {{ choice.label }}
        </button>
      }
    </div>
  `,
})
export class ChoiceChips<T> {
  readonly choices = input.required<readonly Choice<T>[]>();
  readonly selected = model<T | null>(null);
  readonly scroll = input(false);
  readonly ariaLabel = input<string>();
}
