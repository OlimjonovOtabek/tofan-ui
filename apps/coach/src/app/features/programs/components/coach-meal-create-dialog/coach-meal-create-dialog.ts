import { Component, input, output, signal } from '@angular/core';
import { FormField, form, required, schema } from '@angular/forms/signals';
import { ButtonDirective } from '@openng/optimus-ui/button';
import { Dialog } from '@openng/optimus-ui/dialog';
import { InputText } from '@openng/optimus-ui/inputtext';
import { TranslatePipe } from '@core/i18n/translate.pipe';

export interface MealProgramDates {
  startDate: string;
  endDate: string;
}

const ISO_DAY_LENGTH = 10;

const mealSchema = schema<MealProgramDates>((path) => {
  required(path.startDate, { message: 'coach.programs.startDateRequired' });
  required(path.endDate, { message: 'coach.programs.endDateRequired' });
});

@Component({
  selector: 'coach-meal-create-dialog',
  imports: [ButtonDirective, Dialog, FormField, InputText, TranslatePipe],
  templateUrl: './coach-meal-create-dialog.html',
  styleUrl: './coach-meal-create-dialog.css',
})
export class CoachMealCreateDialog {
  private readonly today = new Date().toISOString().slice(0, ISO_DAY_LENGTH);

  protected readonly value = signal<MealProgramDates>({ startDate: this.today, endDate: this.today });
  protected readonly mealForm = form(this.value, mealSchema);

  readonly saving = input(false);
  readonly created = output<MealProgramDates>();
  readonly closed = output<void>();

  protected submit(): void {
    this.mealForm().markAsTouched();
    if (this.mealForm().valid()) {
      this.created.emit(this.value());
    }
  }
}
