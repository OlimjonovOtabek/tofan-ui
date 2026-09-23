import { Component, computed, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { SelectOption } from '@shared/models/select-option';
import { Select } from '@openng/optimus-ui/select';

@Component({
  selector: 'app-select-field',
  imports: [FormsModule, Select],
  template: `
    <p-select
      [inputId]="inputId()"
      [(ngModel)]="value"
      [options]="optionList()"
      optionLabel="label"
      optionValue="value"
      [placeholder]="placeholder()"
      [showClear]="showClear()"
      [fluid]="fluid()"
      [disabled]="disabled()"
      [invalid]="invalid() && touched()"
      (onBlur)="touch.emit()"
    />
  `,
})
export class SelectField<TValue extends string> implements FormValueControl<TValue | null> {
  readonly value = model<TValue | null>(null);
  readonly touched = input(false);
  readonly invalid = input(false);
  readonly disabled = input(false);
  readonly touch = output<void>();

  readonly options = input.required<readonly SelectOption<TValue>[]>();
  readonly inputId = input<string>();
  readonly placeholder = input<string>();
  readonly showClear = input(false);
  readonly fluid = input(false);

  protected readonly optionList = computed(() => [...this.options()]);
}
