import { Component, computed, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { SelectOption } from '@shared/models/select-option';
import { MultiSelect } from '@openng/optimus-ui/multiselect';

@Component({
  selector: 'app-multiselect-field',
  imports: [FormsModule, MultiSelect],
  template: `
    <p-multiselect
      [inputId]="inputId()"
      [ariaLabel]="ariaLabel()"
      [(ngModel)]="value"
      [options]="optionList()"
      optionLabel="label"
      optionValue="value"
      display="chip"
      [placeholder]="placeholder()"
      [showToggleAll]="false"
      [fluid]="fluid()"
      [disabled]="disabled()"
      [invalid]="invalid() && touched()"
      (onBlur)="touch.emit()"
    />
  `,
})
export class MultiselectField<TValue extends string> implements FormValueControl<
  readonly TValue[]
> {
  readonly value = model<readonly TValue[]>([]);
  readonly touched = input(false);
  readonly invalid = input(false);
  readonly disabled = input(false);
  readonly touch = output<void>();

  readonly options = input.required<readonly SelectOption<TValue>[]>();
  readonly inputId = input<string>();
  readonly ariaLabel = input<string>();
  readonly placeholder = input<string>();
  readonly fluid = input(false);

  protected readonly optionList = computed(() => [...this.options()]);
}
