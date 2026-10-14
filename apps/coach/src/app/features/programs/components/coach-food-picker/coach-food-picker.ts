import { Component, inject, input, output, signal } from '@angular/core';
import { ButtonDirective } from '@openng/optimus-ui/button';
import { Dialog } from '@openng/optimus-ui/dialog';
import { Skeleton } from '@openng/optimus-ui/skeleton';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { CoachFoodPickerStore } from '../../coach-food-picker.store';
import { LibrarySource } from '../../models/coach-library-source';
import { CoachMealEditorStore } from '../../coach-meal-editor.store';
import { MealFoodChoice } from '../../models/coach-meal-draft';

@Component({
  selector: 'coach-food-picker',
  imports: [ButtonDirective, Dialog, Skeleton, TranslatePipe],
  templateUrl: './coach-food-picker.html',
  providers: [CoachFoodPickerStore],
  styleUrl: './coach-food-picker.css',
})
export class CoachFoodPicker {
  private readonly locale = inject(LocaleStore);

  private readonly editor = inject(CoachMealEditorStore);

  protected readonly store = inject(CoachFoodPickerStore);
  protected readonly selected = signal<readonly MealFoodChoice[]>([]);

  readonly mealKey = input<string | null>(null);
  readonly closed = output<void>();

  open(): void {
    this.selected.set([]);
    void this.store.reset();
  }

  protected setSource(source: LibrarySource): Promise<void> {
    return this.store.setSource(source);
  }

  protected searchChanged(event: Event): void {
    const input = event.currentTarget;
    if (input instanceof HTMLInputElement) {
      this.store.searchText.set(input.value);
    }
  }

  protected search(): Promise<void> {
    return this.store.load();
  }

  protected toggle(food: MealFoodChoice): void {
    this.selected.update((current) =>
      current.some((item) => item.id === food.id)
        ? current.filter((item) => item.id !== food.id)
        : [...current, food],
    );
  }

  protected isSelected(food: MealFoodChoice): boolean {
    return this.selected().some((item) => item.id === food.id);
  }

  protected addSelected(): void {
    const mealKey = this.mealKey();
    if (mealKey !== null) {
      this.editor.addFoods(mealKey, this.selected());
    }
    this.close();
  }

  protected close(): void {
    this.selected.set([]);
    this.closed.emit();
  }

  protected nameOf(food: MealFoodChoice): string {
    const locale = this.locale.locale();
    return locale === 'ru' ? food.nameRu : locale === 'uz' ? food.nameUz : food.name;
  }
}
