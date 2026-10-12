import { Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { ButtonDirective } from '@openng/optimus-ui/button';
import { Dialog } from '@openng/optimus-ui/dialog';
import { InputText } from '@openng/optimus-ui/inputtext';
import { SelectField } from '@shared/components/select-field/select-field';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { MEAL_TYPE_OPTIONS, MealType } from '@coach/core/fitness/meal-type';
import { MealDraft } from '../../models/coach-meal-draft';

export interface MealValues {
  mealType: MealType;
  title: string;
  plannedTime: string | null;
}

const DEFAULT_MEAL_TYPE: MealType = 'breakfast';

@Component({
  selector: 'coach-meal-dialog',
  imports: [ButtonDirective, Dialog, InputText, SelectField, TranslatePipe],
  templateUrl: './coach-meal-dialog.html',
  styleUrl: './coach-meal-dialog.css',
})
export class CoachMealDialog {
  private readonly translator = inject(Translator);

  readonly meal = input<MealDraft | null>(null);
  readonly confirmed = output<MealValues>();
  readonly removed = output<void>();
  readonly closed = output<void>();

  protected readonly typeOptions = computed(() => this.translator.options(MEAL_TYPE_OPTIONS));
  protected readonly mealType = linkedSignal<MealType>(() => this.meal()?.mealType ?? DEFAULT_MEAL_TYPE);
  protected readonly title = linkedSignal(() => this.meal()?.title ?? '');
  protected readonly plannedTime = linkedSignal(() => this.meal()?.plannedTime ?? '');

  protected typeChanged(mealType: MealType | null): void {
    this.mealType.set(mealType ?? DEFAULT_MEAL_TYPE);
  }

  protected titleChanged(event: Event): void {
    const input = event.currentTarget;
    if (input instanceof HTMLInputElement) {
      this.title.set(input.value);
    }
  }

  protected timeChanged(event: Event): void {
    const input = event.currentTarget;
    if (input instanceof HTMLInputElement) {
      this.plannedTime.set(input.value);
    }
  }

  protected submit(): void {
    this.confirmed.emit({
      mealType: this.mealType(),
      title: this.title().trim(),
      plannedTime: this.plannedTime().length === 0 ? null : this.plannedTime(),
    });
  }
}
