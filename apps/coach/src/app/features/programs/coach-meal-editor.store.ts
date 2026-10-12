import { Injectable, computed, inject, signal } from '@angular/core';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';
import { MealType } from '@coach/core/fitness/meal-type';
import {
  MealDraft,
  MealFoodChoice,
  MealProgramDraft,
  NutritionTotals,
  mealDraftIssue,
  newMeal,
  newMealItem,
  nutritionTotals,
  withQuantity,
} from './models/coach-meal-draft';
import { MealProgramDetails } from './services/coach-program.dto';
import {
  isMealProgramPublished,
  toMealProgramDraft,
  toUpdateMealProgramRequest,
} from './services/coach-meal-program.mapper';
import { CoachProgramsService } from './services/coach-programs.service';

const DRAFT_MEAL_PREFIX = 'draft-meal-';
const DRAFT_ITEM_PREFIX = 'draft-meal-item-';

@Injectable()
export class CoachMealEditorStore {
  private readonly service = inject(CoachProgramsService);
  private readonly notifications = inject(NotificationService);
  private nextNumber = 1;

  readonly programId = signal<string | null>(null);
  readonly program = signal<MealProgramDetails | null>(null);
  readonly isPublished = signal(false);
  readonly draft = signal<MealProgramDraft | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly dirty = signal(false);
  readonly error = signal<ErrorMessage | null>(null);
  readonly issue = computed(() => mealDraftIssue(this.draft()));
  readonly showIssue = signal(false);
  readonly totals = computed(() => nutritionTotals(this.draft()?.meals.flatMap((meal) => meal.items) ?? []));

  mealTotals(meal: MealDraft): NutritionTotals {
    return nutritionTotals(meal.items);
  }

  addFoods(mealKey: string, foods: readonly MealFoodChoice[]): void {
    for (const food of foods) {
      this.addFood(mealKey, food);
    }
  }

  async load(programId: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const [program, summaries] = await Promise.all([
        this.service.getMealPlan(programId),
        this.service.listMealPrograms(),
      ]);
      this.programId.set(programId);
      this.program.set(program);
      this.isPublished.set(isMealProgramPublished(summaries, programId));
      this.draft.set(toMealProgramDraft(program));
      this.dirty.set(false);
      this.showIssue.set(false);
    } catch (error) {
      this.error.set(toErrorMessage(error));
      this.program.set(null);
      this.draft.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  addMeal(mealType: MealType, title: string): string {
    const key = `${DRAFT_MEAL_PREFIX}${this.nextNumber++}`;
    this.updateDraft((draft) => ({
      ...draft,
      meals: [...draft.meals, newMeal(key, mealType, title, draft.meals.length)],
    }));
    return key;
  }

  updateMeal(key: string, values: Partial<Pick<MealDraft, 'mealType' | 'plannedTime' | 'title'>>): void {
    this.updateDraft((draft) => ({
      ...draft,
      meals: draft.meals.map((meal) => meal.key === key ? { ...meal, ...values } : meal),
    }));
  }

  removeMeal(key: string): void {
    this.updateDraft((draft) => ({
      ...draft,
      meals: draft.meals.filter((meal) => meal.key !== key).map((meal, index) => ({ ...meal, displayOrder: index })),
    }));
  }

  addFood(mealKey: string, food: MealFoodChoice): void {
    const key = `${DRAFT_ITEM_PREFIX}${this.nextNumber++}`;
    this.updateDraft((draft) => ({
      ...draft,
      meals: draft.meals.map((meal) =>
        meal.key !== mealKey ? meal : { ...meal, items: [...meal.items, newMealItem(key, food)] },
      ),
    }));
  }

  updateFoodQuantity(mealKey: string, itemKey: string, quantityGrams: number): void {
    this.updateDraft((draft) => ({
      ...draft,
      meals: draft.meals.map((meal) => meal.key !== mealKey ? meal : {
        ...meal,
        items: meal.items.map((item) => item.key !== itemKey ? item : withQuantity(item, quantityGrams)),
      }),
    }));
  }

  removeFood(mealKey: string, itemKey: string): void {
    this.updateDraft((draft) => ({
      ...draft,
      meals: draft.meals.map((meal) => meal.key !== mealKey ? meal : {
        ...meal,
        items: meal.items.filter((item) => item.key !== itemKey),
      }),
    }));
  }

  updateDates(startDate: string, endDate: string): void {
    this.updateDraft((draft) => ({ ...draft, startDate, endDate }));
  }

  async save(): Promise<boolean> {
    const programId = this.programId();
    const draft = this.draft();
    if (programId === null || draft === null || this.saving()) {
      return false;
    }
    if (this.issue() !== null) {
      this.showIssue.set(true);
      return false;
    }
    this.saving.set(true);
    try {
      await this.service.updateMealPlan(programId, toUpdateMealProgramRequest(draft));
      this.notifications.success('coach.programs.saved');
      await this.load(programId);
      return true;
    } catch (error) {
      this.notifications.error(error);
      return false;
    } finally {
      this.saving.set(false);
    }
  }

  private updateDraft(update: (draft: MealProgramDraft) => MealProgramDraft): void {
    const current = this.draft();
    if (current !== null) {
      this.draft.set(update(current));
      this.dirty.set(true);
    }
  }
}
