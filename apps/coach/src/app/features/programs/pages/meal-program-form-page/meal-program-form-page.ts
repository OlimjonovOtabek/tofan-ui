import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { FITNESS_GOALS, FITNESS_GOAL_LABELS } from '@coach/core/fitness/fitness-goal';
import { MEAL_TYPES, MEAL_TYPE_LABELS } from '@coach/core/fitness/meal-type';
import { AppBar } from '@coach/core/ui/app-bar/app-bar';
import { Button } from '@coach/core/ui/button/button';
import { Choice, ChoiceChips } from '@coach/core/ui/choice-chips/choice-chips';
import { EmptyState } from '@coach/core/ui/empty-state/empty-state';
import { Note } from '@coach/core/ui/note/note';
import { Sheets } from '@coach/core/ui/sheets/sheets.service';
import { TextField } from '@coach/core/ui/text-field/text-field';
import { FoodPicker } from '../../components/food-picker/food-picker';
import { MealDraftCard } from '../../components/meal-draft-card/meal-draft-card';
import { MealProgramFormStore } from '../../meal-program-form.store';
import { PickedFood } from '../../models/food';
import { MEAL_PROGRAM_NAME_MAX } from '../../models/meal-program';

@Component({
  selector: 'coach-meal-program-form-page',
  imports: [
    TranslatePipe,
    MessagePipe,
    AppBar,
    Button,
    ChoiceChips,
    EmptyState,
    FoodPicker,
    MealDraftCard,
    Note,
    TextField,
  ],
  providers: [MealProgramFormStore],
  templateUrl: './meal-program-form-page.html',
})
export class MealProgramFormPage {
  protected readonly store = inject(MealProgramFormStore);
  private readonly router = inject(Router);
  private readonly translator = inject(Translator);
  private readonly sheets = inject(Sheets);

  readonly id = input<string | undefined>(undefined);

  protected readonly pickingFor = signal<{ readonly key: string; readonly option: number } | null>(
    null,
  );
  protected readonly nameMax = MEAL_PROGRAM_NAME_MAX;
  protected readonly goals = computed<Choice<(typeof FITNESS_GOALS)[number]>[]>(() =>
    FITNESS_GOALS.map((value) => ({
      value,
      label: this.translator.translate(FITNESS_GOAL_LABELS[value]),
    })),
  );

  constructor() {
    effect(() => {
      const id = this.id() ?? null;
      untracked(() => void this.store.load(id));
    });
  }

  protected back(): string {
    return this.id() === undefined ? '/programs' : `/programs/meal/${this.id()}`;
  }

  protected async addMeal(): Promise<void> {
    const type = await this.sheets.choose(
      this.translator.translate('coachApp.createMeal.pickMeal'),
      MEAL_TYPES.map((value) => ({
        value,
        title: this.translator.translate(MEAL_TYPE_LABELS[value]),
      })),
    );
    if (type !== null) {
      this.store.addMeal(type, this.translator.translate(MEAL_TYPE_LABELS[type]));
    }
  }

  protected pick(key: string, option: number): void {
    this.pickingFor.set({ key, option });
  }

  protected picked(food: PickedFood): void {
    const target = this.pickingFor();
    if (target !== null) {
      this.store.addFood(target.key, target.option, food);
      this.pickingFor.set(null);
    }
  }

  protected closePicker(): void {
    this.pickingFor.set(null);
  }

  protected async submit(): Promise<void> {
    const id = await this.store.submit();
    if (id !== null) {
      await this.router.navigate(['/programs/meal', id], { replaceUrl: true });
    }
  }
}
