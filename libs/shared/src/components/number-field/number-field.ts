import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { InputNumber } from '@openng/optimus-ui/inputnumber';

@Component({
  selector: 'app-number-field',
  imports: [FormsModule, InputNumber],
  template: `
    <p-inputnumber
      [inputId]="inputId()"
      [(ngModel)]="value"
      [min]="min() ?? null"
      [max]="max() ?? null"
      [showButtons]="showButtons()"
      [suffix]="suffix()"
      [useGrouping]="useGrouping()"
      [placeholder]="placeholder()"
      [fluid]="fluid()"
      [disabled]="disabled()"
      [invalid]="invalid() && touched()"
      (onBlur)="touch.emit()"
    />
  `,
})
export class NumberField implements FormValueControl<number | null> {
  readonly value = model<number | null>(null);
  readonly touched = input(false);
  readonly invalid = input(false);
  readonly disabled = input(false);
  readonly min = input<number | undefined>(undefined);
  readonly max = input<number | undefined>(undefined);
  readonly touch = output<void>();

  readonly inputId = input<string>();
  readonly showButtons = input(false);
  readonly suffix = input('');
  readonly useGrouping = input(true);
  readonly placeholder = input('');
  readonly fluid = input(false);
}
