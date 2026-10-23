import { Component, computed, inject, output, signal } from '@angular/core';
import { LocaleStore } from '@core/i18n/locale.store';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { pickLocalized } from '@shared/models/localized-text';
import { SERVING_UNIT_LABELS, ServingUnit } from '@coach/core/fitness/serving-unit';
import { Button } from '@coach/core/ui/button/button';
import { Choice, ChoiceChips } from '@coach/core/ui/choice-chips/choice-chips';
import { EmptyState } from '@coach/core/ui/empty-state/empty-state';
import { Sheet } from '@coach/core/ui/sheet/sheet';
import { Spinner } from '@coach/core/ui/spinner/spinner';
import { TextField } from '@coach/core/ui/text-field/text-field';
import { FoodPickerStore } from '../../food-picker.store';
import {
  Food,
  PickedFood,
  caloriesFor,
  defaultQuantity,
  formatQuantity,
  parseQuantity,
  unitsFor,
} from '../../models/food';

const DEBOUNCE_MS = 350;

@Component({
  selector: 'coach-food-picker',
  imports: [TranslatePipe, MessagePipe, Button, ChoiceChips, EmptyState, Sheet, Spinner, TextField],
  providers: [FoodPickerStore],
  templateUrl: './food-picker.html',
  styleUrl: './food-picker.css',
})
export class FoodPicker {
  protected readonly store = inject(FoodPickerStore);
  private readonly translator = inject(Translator);
  private readonly locale = inject(LocaleStore).locale;
  private timer: ReturnType<typeof setTimeout> | null = null;

  readonly picked = output<PickedFood>();

  protected readonly query = signal('');
  protected readonly chosen = signal<Food | null>(null);
  protected readonly unit = signal<ServingUnit>('grams');
  protected readonly amount = signal('');
  protected readonly allowedChars = /[0-9.,]/;
  protected readonly sheetOpen = computed(() => this.chosen() !== null);

  protected readonly quantity = computed(() => parseQuantity(this.amount()));
  protected readonly kcal = computed(() => {
    const food = this.chosen();
    const quantity = this.quantity();
    return food === null || quantity === null ? null : caloriesFor(food, quantity, this.unit());
  });
  protected readonly unitChoices = computed<Choice<ServingUnit>[]>(() => {
    const food = this.chosen();
    return food === null
      ? []
      : unitsFor(food).map((value) => ({
          value,
          label: this.translator.translate(SERVING_UNIT_LABELS[value]),
        }));
  });
  protected readonly unitSuffix = computed(() =>
    this.translator.translate(SERVING_UNIT_LABELS[this.unit()]),
  );

  constructor() {
    void this.store.search('');
  }

  protected typed(value: string): void {
    this.query.set(value);
    if (this.timer !== null) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => void this.store.search(value), DEBOUNCE_MS);
  }

  protected nameOf(food: Food): string {
    return pickLocalized(food.name, this.locale());
  }

  protected portion(food: Food): string {
    const unit = unitsFor(food)[0];
    const quantity = defaultQuantity(food, unit);
    const kcal = caloriesFor(food, quantity, unit);
    const portion = `${formatQuantity(quantity)} ${this.translator.translate(SERVING_UNIT_LABELS[unit])}`;
    return kcal === null
      ? portion
      : this.translator.translate('coachApp.meal.itemPortionKcal', { portion, kcal });
  }

  protected choose(food: Food): void {
    const unit = unitsFor(food)[0];
    this.unit.set(unit);
    this.amount.set(formatQuantity(defaultQuantity(food, unit)));
    this.chosen.set(food);
  }

  protected selectUnit(unit: ServingUnit | null): void {
    const food = this.chosen();
    if (unit !== null && food !== null) {
      this.unit.set(unit);
      this.amount.set(formatQuantity(defaultQuantity(food, unit)));
    }
  }

  protected closeSheet(open: boolean): void {
    if (!open) {
      this.chosen.set(null);
    }
  }

  protected confirm(): void {
    const food = this.chosen();
    const quantity = this.quantity();
    if (food !== null && quantity !== null) {
      this.picked.emit({ food, quantity, unit: this.unit(), estimatedCost: null });
      this.chosen.set(null);
    }
  }
}
