import { Component, input, model, output } from '@angular/core';
import { FormCheckboxControl } from '@angular/forms/signals';

@Component({
  selector: 'coach-switch',
  template: `
    <button
      type="button"
      role="switch"
      class="track"
      [class.is-on]="checked()"
      [attr.aria-checked]="checked()"
      [attr.aria-label]="ariaLabel()"
      [disabled]="disabled()"
      (click)="toggle()"
    >
      <span class="thumb"></span>
    </button>
  `,
  styleUrl: './switch.css',
})
export class Switch implements FormCheckboxControl {
  readonly checked = model(false);
  readonly disabled = input(false);
  readonly ariaLabel = input<string>();
  readonly touch = output<void>();

  protected toggle(): void {
    this.checked.update((checked) => !checked);
    this.touch.emit();
  }
}
