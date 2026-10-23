import { Component, computed, inject, input, output, signal } from '@angular/core';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { pickLocalized } from '@shared/models/localized-text';
import { SERVING_UNIT_LABELS } from '@coach/core/fitness/serving-unit';
import { Choice, ChoiceChips } from '@coach/core/ui/choice-chips/choice-chips';
import { Icon } from '@coach/core/ui/icon/icon';
import { TextButton } from '@coach/core/ui/text-button/text-button';
import { PickedFood, caloriesFor, formatQuantity } from '../../models/food';
import { MealDraft, optionCalories } from '../../models/meal-draft';

@Component({
  selector: 'coach-meal-draft-card',
  imports: [TranslatePipe, ChoiceChips, Icon, TextButton],
  templateUrl: './meal-draft-card.html',
  styleUrl: './meal-draft-card.css',
  host: { class: 'c-card' },
})
export class MealDraftCard {
  private readonly translator = inject(Translator);
  private readonly locale = inject(LocaleStore).locale;

  readonly meal = input.required<MealDraft>();
  readonly addFood = output<number>();
  readonly removeItem = output<{ option: number; index: number }>();
  readonly addOption = output<void>();
  readonly removeOption = output<number>();
  readonly removeMeal = output<void>();

  private readonly picked = signal(0);
  protected readonly option = computed(() =>
    Math.min(this.picked(), this.meal().options.length - 1),
  );
  protected readonly items = computed(() => this.meal().options[this.option()]);
  protected readonly kcal = computed(() => optionCalories(this.items()));
  protected readonly choices = computed<Choice<number>[]>(() =>
    this.meal().options.map((_, value) => ({
      value,
      label: this.translator.translate('coachApp.meal.optionNumber', { number: value + 1 }),
    })),
  );

  protected select(option: number | null): void {
    this.picked.set(option ?? 0);
  }

  protected grow(): void {
    this.addOption.emit();
    this.picked.set(this.meal().options.length);
  }

  protected nameOf(item: PickedFood): string {
    return pickLocalized(item.food.name, this.locale());
  }

  protected portion(item: PickedFood): string {
    const portion = `${formatQuantity(item.quantity)} ${this.translator.translate(SERVING_UNIT_LABELS[item.unit])}`;
    const kcal = caloriesFor(item.food, item.quantity, item.unit);
    return kcal === null
      ? portion
      : this.translator.translate('coachApp.meal.itemPortionKcal', { portion, kcal });
  }
}
