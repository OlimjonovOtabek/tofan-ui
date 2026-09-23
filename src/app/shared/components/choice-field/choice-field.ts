import { Component, computed, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { SelectOption } from '@shared/models/select-option';
import { SelectButton } from '@openng/optimus-ui/selectbutton';

@Component({
  selector: 'app-choice-field',
  imports: [FormsModule, SelectButton],
  template: `
    <p-selectbutton
      [(ngModel)]="value"
      [options]="optionList()"
      optionLabel="label"
      optionValue="value"
      [allowEmpty]="false"
      [fluid]="fluid()"
      [disabled]="disabled()"
      [invalid]="invalid() && touched()"
      [ariaLabelledBy]="ariaLabelledBy()"
      (onChange)="touch.emit()"
    />
  `,
})
export class ChoiceField<TValue extends string> implements FormValueControl<TValue | null> {
  readonly value = model<TValue | null>(null);
  readonly touched = input(false);
  readonly invalid = input(false);
  readonly disabled = input(false);
  readonly touch = output<void>();

  readonly options = input.required<readonly SelectOption<TValue>[]>();
  readonly ariaLabelledBy = input<string>();
  readonly fluid = input(false);

  protected readonly optionList = computed(() => [...this.options()]);
}
