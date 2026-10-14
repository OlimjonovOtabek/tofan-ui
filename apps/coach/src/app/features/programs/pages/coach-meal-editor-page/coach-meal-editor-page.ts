import { MealType } from '@coach/core/fitness/meal-type';
import { Message } from '@openng/optimus-ui/message';
import { Skeleton } from '@openng/optimus-ui/skeleton';
import { ButtonDirective } from '@openng/optimus-ui/button';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, CanDeactivateFn, RouterLink } from '@angular/router';
import { ConfirmDialogService } from '@core/feedback/confirmation.service';
import { formatCalendarDate } from '@core/i18n/date-format';
import { LocaleStore } from '@core/i18n/locale.store';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { CoachFoodPicker } from '../../components/coach-food-picker/coach-food-picker';
import { CoachMealCard } from '../../components/coach-meal-card/coach-meal-card';
import { CoachMealDialog, MealValues } from '../../components/coach-meal-dialog/coach-meal-dialog';
import { CoachMealEditorStore } from '../../coach-meal-editor.store';
import { CoachMealTotals } from '../../components/coach-meal-totals/coach-meal-totals';
import { CoachSaveBar } from '../../components/coach-save-bar/coach-save-bar';

const DEFAULT_NEW_MEAL_TYPE: MealType = 'breakfast';

@Component({
  selector: 'coach-meal-editor-page',
  imports: [
    Message,
    Skeleton,
    ButtonDirective,
    RouterLink,
    MessagePipe,
    TranslatePipe,
    CoachFoodPicker,
    CoachMealCard,
    CoachMealDialog,
    CoachMealTotals,
    CoachSaveBar,
  ],
  providers: [CoachMealEditorStore],
  templateUrl: './coach-meal-editor-page.html',
  styleUrl: './coach-meal-editor-page.css',
})
export class CoachMealEditorPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly confirmations = inject(ConfirmDialogService);
  private readonly locale = inject(LocaleStore);

  protected readonly store = inject(CoachMealEditorStore);
  protected readonly editingMealKey = signal<string | null>(null);
  protected readonly pickerMealKey = signal<string | null>(null);
  protected readonly editingMeal = computed(
    () => this.store.draft()?.meals.find((meal) => meal.key === this.editingMealKey()) ?? null,
  );
  protected readonly rangeLabel = computed(() => {
    const draft = this.store.draft();
    if (draft === null) {
      return '';
    }
    return `${this.dateLabel(draft.startDate)} – ${this.dateLabel(draft.endDate)}`;
  });

  ngOnInit(): void {
    const id = this.programId();
    if (id !== null) {
      void this.store.load(id);
    }
  }

  async canLeave(): Promise<boolean> {
    if (!this.store.dirty()) {
      return true;
    }
    return this.confirmations.confirm({ key: 'coach.programs.unsavedWarning' });
  }

  protected addMeal(): void {
    this.editingMealKey.set(this.store.addMeal(DEFAULT_NEW_MEAL_TYPE, ''));
  }

  protected saveMeal(values: MealValues): void {
    const key = this.editingMealKey();
    if (key !== null) {
      this.store.updateMeal(key, values);
    }
    this.editingMealKey.set(null);
  }

  protected removeMeal(): void {
    const key = this.editingMealKey();
    if (key !== null) {
      this.store.removeMeal(key);
    }
    this.editingMealKey.set(null);
  }

  protected async discard(): Promise<void> {
    const id = this.programId();
    if (id !== null && (await this.confirmations.confirm({ key: 'coach.programs.unsavedWarning' }))) {
      await this.store.load(id);
    }
  }

  private dateLabel(value: string): string {
    return formatCalendarDate(new Date(`${value}T00:00:00Z`), this.locale.locale());
  }

  private programId(): string | null {
    return this.route.snapshot.paramMap.get('id');
  }
}

export const canDeactivateMealEditor: CanDeactivateFn<CoachMealEditorPage> = (component) =>
  component.canLeave();
