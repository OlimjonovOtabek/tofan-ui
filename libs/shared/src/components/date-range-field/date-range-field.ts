import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { DatePicker } from '@openng/optimus-ui/datepicker';
import { DayRange } from '@shared/utils/day-range';

const DATE_FORMAT = 'dd.mm.yy';

@Component({
  selector: 'app-date-range-field',
  imports: [FormsModule, DatePicker],
  template: `
    <p-datepicker
      [inputId]="inputId()"
      [(ngModel)]="value"
      selectionMode="range"
      [readonlyInput]="true"
      [showButtonBar]="true"
      [showIcon]="true"
      [minDate]="minDate() ?? null"
      [maxDate]="maxDate() ?? null"
      [dateFormat]="dateFormat"
      [placeholder]="placeholder()"
      [fluid]="fluid()"
      [disabled]="disabled()"
      (onBlur)="touch.emit()"
      (onClose)="touch.emit()"
    />
  `,
})
export class DateRangeField implements FormValueControl<DayRange> {
  readonly value = model<DayRange>(null);
  readonly touched = input(false);
  readonly disabled = input(false);
  readonly minDate = input<Date | undefined>(undefined);
  readonly maxDate = input<Date | undefined>(undefined);
  readonly touch = output<void>();

  readonly inputId = input<string>();
  readonly placeholder = input('');
  readonly fluid = input(false);

  protected readonly dateFormat = DATE_FORMAT;
}
