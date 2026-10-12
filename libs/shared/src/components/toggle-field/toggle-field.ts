import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormCheckboxControl } from '@angular/forms/signals';
import { ToggleSwitch } from '@openng/optimus-ui/toggleswitch';

@Component({
  selector: 'app-toggle-field',
  imports: [FormsModule, ToggleSwitch],
  template: `<p-toggleswitch
    [(ngModel)]="checked"
    [inputId]="inputId()"
    [disabled]="disabled()"
    [ariaLabel]="ariaLabel()"
    (onChange)="touch.emit()"
  />`,
})
export class ToggleField implements FormCheckboxControl {
  readonly checked = model(false);
  readonly disabled = input(false);
  readonly touched = input(false);
  readonly touch = output<void>();
  readonly inputId = input<string>();
  readonly ariaLabel = input<string>();
}
