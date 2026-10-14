import { Injectable, computed, inject, signal } from '@angular/core';
import { NotificationService } from '@core/feedback/notification.service';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { NewWorkoutProgram, WorkoutProgram } from './models/coach-program';
import { CoachProgramsService } from './services/coach-programs.service';
import { CoachProfileService } from '@coach/core/profile/coach-profile.service';
import { CoachProfile } from '@coach/core/profile/coach-profile.dto';
import {
  CreateMealProgramRequest,
  MealProgramSummary,
} from './services/coach-program.dto';

@Injectable()
export class CoachProgramsStore {
  private readonly service = inject(CoachProgramsService);
  private readonly notifications = inject(NotificationService);
  private readonly profiles = inject(CoachProfileService);

  readonly workouts = signal<readonly WorkoutProgram[]>([]);
  readonly meals = signal<readonly MealProgramSummary[]>([]);
  readonly loading = signal(false);
  readonly loaded = signal(false);
  readonly saving = signal(false);
  readonly workoutError = signal<ErrorMessage | null>(null);
  readonly mealError = signal<ErrorMessage | null>(null);
  readonly profile = signal<CoachProfile | null>(null);
  readonly publishing = signal(false);
  readonly publishRefreshFailed = signal(false);
  readonly profileError = signal<ErrorMessage | null>(null);
  readonly publishedWorkout = computed(() => this.workouts().find((item) => item.isPublished) ?? null);
  readonly publishedMeal = computed(() => this.meals().find((item) => item.isPublished) ?? null);
  readonly profileReady = computed(() => (this.profile()?.monthlyPrice ?? 0) > 0);

  async load(): Promise<void> {
    this.loading.set(true);
    this.workoutError.set(null);
    this.mealError.set(null);
    const [workouts, meals, profile] = await Promise.allSettled([
      this.service.listWorkoutPrograms(),
      this.service.listMealPrograms(),
      this.profiles.get(),
    ]);
    this.setWorkouts(workouts);
    this.setMeals(meals);
    this.setProfile(profile);
    this.loaded.set(true);
    this.loading.set(false);
  }

  private setProfile(result: PromiseSettledResult<CoachProfile>): void {
    if (result.status === 'fulfilled') {
      this.profile.set(result.value);
      this.profileError.set(null);
      return;
    }
    this.profile.set(null);
    this.profileError.set(toErrorMessage(result.reason));
  }

  async createWorkout(program: NewWorkoutProgram): Promise<string | null> {
    return this.saveProgram(() => this.service.createWorkout(program));
  }

  async createMeal(request: CreateMealProgramRequest): Promise<string | null> {
    return this.saveProgram(() => this.service.createMeal(request));
  }

  async publishWorkout(program: WorkoutProgram): Promise<boolean> {
    return this.publishProgram(() => this.service.publishWorkout(program.id));
  }

  async publishMeal(program: MealProgramSummary): Promise<boolean> {
    return this.publishProgram(() => this.service.publishMeal(program.id));
  }

  private async saveProgram(create: () => Promise<string>): Promise<string | null> {
    this.saving.set(true);
    try {
      const id = await create();
      this.notifications.success('coach.programs.created');
      await this.load();
      return id;
    } catch (error) {
      this.notifications.error(error);
      return null;
    } finally {
      this.saving.set(false);
    }
  }

  private async publishProgram(publish: () => Promise<void>): Promise<boolean> {
    if (this.publishing()) {
      return false;
    }
    this.publishing.set(true);
    try {
      await publish();
    } catch (error) {
      this.notifications.error(error);
      return false;
    } finally {
      this.publishing.set(false);
    }
    this.notifications.success('coach.programs.publishedToast');
    await this.load();
    this.publishRefreshFailed.set(this.workoutError() !== null || this.mealError() !== null);
    return true;
  }

  async refresh(): Promise<void> {
    await this.load();
    this.publishRefreshFailed.set(this.workoutError() !== null || this.mealError() !== null);
  }

  private setWorkouts(result: PromiseSettledResult<WorkoutProgram[]>): void {
    if (result.status === 'fulfilled') {
      this.workouts.set(result.value);
      return;
    }
    this.workouts.set([]);
    this.workoutError.set(toErrorMessage(result.reason));
  }

  private setMeals(result: PromiseSettledResult<MealProgramSummary[]>): void {
    if (result.status === 'fulfilled') {
      this.meals.set(result.value);
      return;
    }
    this.meals.set([]);
    this.mealError.set(toErrorMessage(result.reason));
  }
}
