import { Injectable, inject, signal } from '@angular/core';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';
import { MealProgram } from './models/meal-program';
import { ProgramKind } from './models/program-kind';
import { WorkoutProgram, publishedFirst } from './models/workout-program';
import { MealProgramsService } from './services/meal-programs.service';
import { WorkoutProgramsService } from './services/workout-programs.service';

@Injectable()
export class ProgramsListStore {
  private readonly workoutService = inject(WorkoutProgramsService);
  private readonly mealService = inject(MealProgramsService);
  private readonly notifications = inject(NotificationService);

  readonly workouts = signal<WorkoutProgram[] | null>(null);
  readonly workoutsError = signal<ErrorMessage | null>(null);
  readonly meals = signal<MealProgram[] | null>(null);
  readonly mealsError = signal<ErrorMessage | null>(null);
  readonly publishingId = signal<string | null>(null);

  async load(kind: ProgramKind): Promise<void> {
    if (kind === 'workout') {
      await this.loadWorkouts();
    } else {
      await this.loadMeals();
    }
  }

  async loadWorkouts(): Promise<void> {
    this.workoutsError.set(null);
    try {
      this.workouts.set(publishedFirst(await this.workoutService.list()));
    } catch (error) {
      this.workouts.set(null);
      this.workoutsError.set(toErrorMessage(error));
    }
  }

  async loadMeals(): Promise<void> {
    this.mealsError.set(null);
    try {
      this.meals.set(publishedFirst(await this.mealService.list()));
    } catch (error) {
      this.meals.set(null);
      this.mealsError.set(toErrorMessage(error));
    }
  }

  async publish(kind: ProgramKind, id: string): Promise<void> {
    if (this.publishingId() !== null) {
      return;
    }
    this.publishingId.set(id);
    try {
      await (kind === 'workout' ? this.workoutService.publish(id) : this.mealService.publish(id));
      this.notifications.success('coachApp.programs.publishSuccess');
      await this.load(kind);
    } catch (error) {
      this.notifications.error(error);
    } finally {
      this.publishingId.set(null);
    }
  }
}
