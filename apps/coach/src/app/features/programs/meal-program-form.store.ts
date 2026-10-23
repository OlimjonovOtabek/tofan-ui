import { Injectable, computed, inject, signal } from '@angular/core';
import { FitnessGoal } from '@coach/core/fitness/fitness-goal';
import { MealType } from '@coach/core/fitness/meal-type';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';
import { PickedFood } from './models/food';
import {
  MealDraft,
  canSubmitMealProgram,
  dayOrderIndexFor,
  mealDraftsOf,
  newMealDraft,
} from './models/meal-draft';
import { MealProgramsService } from './services/meal-programs.service';

@Injectable()
export class MealProgramFormStore {
  private readonly service = inject(MealProgramsService);
  private readonly notifications = inject(NotificationService);
  private programId: string | null = null;
  private nextKey = 0;

  readonly name = signal('');
  readonly goal = signal<FitnessGoal | null>(null);
  readonly meals = signal<readonly MealDraft[]>([]);
  readonly published = signal(false);
  readonly saving = signal(false);
  readonly loadError = signal<ErrorMessage | null>(null);

  readonly canSubmit = computed(() => canSubmitMealProgram(this.name(), this.meals()));

  async load(id: string | null): Promise<void> {
    this.programId = id;
    if (id === null) {
      return;
    }
    this.loadError.set(null);
    try {
      const program = await this.service.get(id);
      this.name.set(program.name);
      this.goal.set(program.goal);
      this.meals.set(mealDraftsOf(program.meals));
      this.published.set(program.isPublished);
    } catch (error) {
      this.loadError.set(toErrorMessage(error));
    }
  }

  addMeal(type: MealType, title: string): void {
    const meal = newMealDraft(`new-${this.nextKey++}`, type, title);
    this.meals.update((meals) => {
      const copy = [...meals];
      copy.splice(dayOrderIndexFor(type, meals), 0, meal);
      return copy;
    });
  }

  removeMeal(key: string): void {
    this.meals.update((meals) => meals.filter((meal) => meal.key !== key));
  }

  addFood(key: string, option: number, food: PickedFood): void {
    this.changeOptions(key, (options) =>
      options.map((items, at) => (at === option ? [...items, food] : items)),
    );
  }

  removeFood(key: string, option: number, index: number): void {
    this.changeOptions(key, (options) =>
      options.map((items, at) =>
        at === option ? items.filter((_, itemAt) => itemAt !== index) : items,
      ),
    );
  }

  addOption(key: string): void {
    this.changeOptions(key, (options) => [...options, []]);
  }

  removeOption(key: string, option: number): void {
    this.changeOptions(key, (options) =>
      options.length > 1 ? options.filter((_, at) => at !== option) : options,
    );
  }

  async submit(): Promise<string | null> {
    if (!this.canSubmit() || this.saving()) {
      return null;
    }
    this.saving.set(true);
    try {
      if (this.programId === null) {
        const id = await this.service.create(this.name(), this.goal(), this.meals());
        this.notifications.success('coachApp.createProgram.success');
        return id;
      }
      await this.service.update(this.programId, this.name(), this.goal(), this.meals());
      this.notifications.success('coachApp.common.saved');
      return this.programId;
    } catch (error) {
      this.notifications.error(error);
      return null;
    } finally {
      this.saving.set(false);
    }
  }

  private changeOptions(
    key: string,
    change: (options: MealDraft['options']) => MealDraft['options'],
  ): void {
    this.meals.update((meals) =>
      meals.map((meal) => (meal.key === key ? { ...meal, options: change(meal.options) } : meal)),
    );
  }
}
