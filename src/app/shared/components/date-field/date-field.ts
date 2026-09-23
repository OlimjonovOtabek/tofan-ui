import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { DatePicker } from '@openng/optimus-ui/datepicker';

const DATE_FORMAT = 'dd.mm.yy';

@Component({
  selector: 'app-date-field',
  imports: [FormsModule, DatePicker],
  template: `
    <p-datepicker
      [inputId]="inputId()"
      [(ngModel)]="value"
      [minDate]="min() ?? null"
      [maxDate]="max() ?? null"
      [dateFormat]="dateFormat"
      [showIcon]="true"
      [fluid]="fluid()"
      [disabled]="disabled()"
      [invalid]="invalid() && touched()"
      (onBlur)="touch.emit()"
      (onClose)="touch.emit()"
    />
  `,
})
export class DateField implements FormValueControl<Date | null> {
  readonly value = model<Date | null>(null);
  readonly touched = input(false);
  readonly invalid = input(false);
  readonly disabled = input(false);
  readonly min = input<Date | undefined>(undefined);
  readonly max = input<Date | undefined>(undefined);
  readonly touch = output<void>();

  readonly inputId = input<string>();
  readonly fluid = input(false);

  protected readonly dateFormat = DATE_FORMAT;
}
