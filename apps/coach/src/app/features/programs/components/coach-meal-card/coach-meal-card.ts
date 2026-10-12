import { Component, computed, inject, input, output } from '@angular/core';
import { ButtonDirective } from '@openng/optimus-ui/button';
import { NumberField } from '@shared/components/number-field/number-field';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { MEAL_TYPE_LABELS } from '@coach/core/fitness/meal-type';
import { CoachMealEditorStore } from '../../coach-meal-editor.store';
import { MealDraft, MealItemDraft } from '../../models/coach-meal-draft';

const MACRO_DECIMALS = 1;
const MIN_QUANTITY_GRAMS = 0.1;

@Component({
  selector: 'coach-meal-card',
  imports: [ButtonDirective, NumberField, TranslatePipe],
  templateUrl: './coach-meal-card.html',
  styleUrl: './coach-meal-card.css',
})
export class CoachMealCard {
  private readonly translator = inject(Translator);
  private readonly locale = inject(LocaleStore);

  private readonly macroLetters = computed(() => ({
    protein: this.translator.translate('coach.workspace.protein').slice(0, 1),
    carbs: this.translator.translate('coach.workspace.carbs').slice(0, 1),
    fat: this.translator.translate('coach.workspace.fat').slice(0, 1),
  }));

  protected readonly store = inject(CoachMealEditorStore);
  protected readonly minQuantity = MIN_QUANTITY_GRAMS;

  readonly meal = input.required<MealDraft>();
  readonly editRequested = output<void>();
  readonly pickRequested = output<void>();

  protected readonly typeLabel = computed(() =>
    this.translator.translate(MEAL_TYPE_LABELS[this.meal().mealType]),
  );
  protected readonly totals = computed(() => this.store.mealTotals(this.meal()));

  protected foodName(item: MealItemDraft): string {
    const locale = this.locale.locale();
    return locale === 'ru' ? item.nameRu : locale === 'uz' ? item.nameUz : item.name;
  }

  protected macros(source: { proteinGrams: number; carbsGrams: number; fatGrams: number }): string {
    const letters = this.macroLetters();
    const fixed = (value: number): string => value.toFixed(MACRO_DECIMALS);
    return `${letters.protein} ${fixed(source.proteinGrams)} · ${letters.carbs} ${fixed(source.carbsGrams)} · ${letters.fat} ${fixed(source.fatGrams)} g`;
  }

  protected quantityChanged(quantity: number | null, item: MealItemDraft): void {
    if (quantity !== null && Number.isFinite(quantity) && quantity > 0) {
      this.store.updateFoodQuantity(this.meal().key, item.key, quantity);
    }
  }

  protected removeFood(item: MealItemDraft): void {
    this.store.removeFood(this.meal().key, item.key);
  }
}
