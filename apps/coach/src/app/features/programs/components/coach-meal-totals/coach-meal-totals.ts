import { Component, computed, inject } from '@angular/core';
import { InputText } from '@openng/optimus-ui/inputtext';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { CoachMealEditorStore } from '../../coach-meal-editor.store';

interface MacroRow {
  labelKey: 'coach.workspace.protein' | 'coach.workspace.carbs' | 'coach.workspace.fat';
  grams: number;
  tone: 'protein' | 'carbs' | 'fat';
}

const MACRO_DECIMALS = 1;

@Component({
  selector: 'coach-meal-totals',
  imports: [InputText, TranslatePipe],
  templateUrl: './coach-meal-totals.html',
  styleUrl: './coach-meal-totals.css',
})
export class CoachMealTotals {
  protected readonly store = inject(CoachMealEditorStore);
  protected readonly rows = computed<readonly MacroRow[]>(() => {
    const totals = this.store.totals();
    return [
      { labelKey: 'coach.workspace.protein', grams: totals.proteinGrams, tone: 'protein' },
      { labelKey: 'coach.workspace.carbs', grams: totals.carbsGrams, tone: 'carbs' },
      { labelKey: 'coach.workspace.fat', grams: totals.fatGrams, tone: 'fat' },
    ];
  });

  protected grams(value: number): string {
    return value.toFixed(MACRO_DECIMALS);
  }

  protected dateChanged(event: Event, field: 'startDate' | 'endDate'): void {
    const input = event.currentTarget;
    const draft = this.store.draft();
    if (!(input instanceof HTMLInputElement) || draft === null) {
      return;
    }
    this.store.updateDates(
      field === 'startDate' ? input.value : draft.startDate,
      field === 'endDate' ? input.value : draft.endDate,
    );
  }
}
