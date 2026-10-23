import { Component, computed, input, model } from '@angular/core';

export interface Segment<T> {
  readonly value: T;
  readonly label: string;
}

@Component({
  selector: 'coach-segmented',
  template: `
    <div class="track" role="radiogroup" [attr.aria-label]="ariaLabel()">
      <span
        class="thumb"
        [class.is-hidden]="index() < 0"
        [style.width]="thumbWidth()"
        [style.transform]="thumbOffset()"
      ></span>
      @for (segment of segments(); track segment.value) {
        <button
          type="button"
          role="radio"
          class="segment"
          [class.is-selected]="segment.value === selected()"
          [attr.aria-checked]="segment.value === selected()"
          (click)="selected.set(segment.value)"
        >
          {{ segment.label }}
        </button>
      }
    </div>
  `,
  styleUrl: './segmented.css',
})
export class Segmented<T> {
  readonly segments = input.required<readonly Segment<T>[]>();
  readonly selected = model.required<T>();
  readonly ariaLabel = input<string>();

  protected readonly index = computed(() =>
    this.segments().findIndex((segment) => segment.value === this.selected()),
  );
  protected readonly thumbWidth = computed(() => `calc((100% - 8px) / ${this.segments().length})`);
  protected readonly thumbOffset = computed(
    () => `translateX(${Math.max(this.index(), 0) * 100}%)`,
  );
}
