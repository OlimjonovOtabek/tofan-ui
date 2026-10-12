import { Injectable, computed, inject, signal } from '@angular/core';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';
import { CoachWorkoutEditorService } from './services/coach-workout-editor.service';
import { WorkoutPlan } from './models/coach-program';
import { Weekday, WorkoutSplit } from './models/coach-program-attributes';
import {
  toCreateDayRequest,
  toUpdateDayRequest,
  toWorkoutDayDraft,
} from './services/coach-workout-day.mapper';
import {
  WorkoutDayDraft,
  WorkoutDayExerciseDraft,
  WorkoutDaySaveState,
  WorkoutExerciseChoice,
  newWorkoutDay,
  newWorkoutExercise,
  workoutDraftIssue,
} from './models/coach-workout-draft';

const DRAFT_DAY_PREFIX = 'draft-day-';
const DRAFT_EXERCISE_PREFIX = 'draft-exercise-';

@Injectable()
export class CoachWorkoutEditorStore {
  private readonly service = inject(CoachWorkoutEditorService);
  private readonly notifications = inject(NotificationService);
  private readonly dirtyDayKeys = new Set<string>();
  private readonly deletedDayIds = new Set<string>();
  private nextDraftNumber = 1;
  private readonly failures = new Map<string, unknown>();

  readonly plan = signal<WorkoutPlan | null>(null);
  readonly isPublished = signal(false);
  readonly days = signal<readonly WorkoutDayDraft[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly dirty = signal(false);
  readonly error = signal<ErrorMessage | null>(null);
  readonly issue = computed(() => workoutDraftIssue(this.days()));
  readonly showIssue = signal(false);
  readonly saveStates = signal<ReadonlyMap<string, WorkoutDaySaveState>>(new Map());

  async load(planId: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const [plan, allDays, isPublished] = await Promise.all([
        this.service.getPlan(planId),
        this.service.listAllDays(),
        this.service.getProgramPublished(planId),
      ]);
      this.plan.set(plan);
      this.isPublished.set(isPublished);
      this.days.set(allDays.filter((day) => day.workoutPlanId === planId).map(toWorkoutDayDraft));
      this.dirtyDayKeys.clear();
      this.deletedDayIds.clear();
      this.failures.clear();
      this.saveStates.set(new Map());
      this.showIssue.set(false);
      this.dirty.set(false);
    } catch (error) {
      this.plan.set(null);
      this.days.set([]);
      this.error.set(toErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  addDay(title: string, dayOfWeek: Weekday, splitType: WorkoutSplit, isRestDay: boolean): string | null {
    const plan = this.plan();
    if (plan === null) {
      return null;
    }
    const key = `${DRAFT_DAY_PREFIX}${this.nextDraftNumber++}`;
    const settings = { title, dayOfWeek, splitType, isRestDay };
    this.days.update((days) => [...days, newWorkoutDay(key, plan.id, days.length, settings)]);
    this.markDayChanged(key);
    return key;
  }

  updateDay(key: string, values: Partial<Pick<WorkoutDayDraft, 'dayOfWeek' | 'splitType' | 'title' | 'isRestDay'>>): void {
    this.days.update((days) => days.map((day) => day.key !== key ? day : {
      ...day,
      ...values,
      ...(values.isRestDay === true ? { exercises: [] } : {}),
    }));
    this.markDayChanged(key);
  }

  removeDay(key: string): void {
    const day = this.days().find((item) => item.key === key);
    if (day?.id !== null && day?.id !== undefined) {
      this.deletedDayIds.add(day.id);
    }
    this.days.update((days) => days.filter((item) => item.key !== key));
    this.dirty.set(true);
  }

  addExercises(dayKey: string, exercises: readonly WorkoutExerciseChoice[]): void {
    for (const exercise of exercises) {
      this.addExercise(dayKey, exercise);
    }
  }

  addExercise(dayKey: string, exercise: WorkoutExerciseChoice): void {
    this.days.update((days) => days.map((day) => {
      if (day.key !== dayKey) {
        return day;
      }
      const key = `${DRAFT_EXERCISE_PREFIX}${this.nextDraftNumber++}`;
      return {
        ...day,
        isRestDay: false,
        exercises: [...day.exercises, newWorkoutExercise(key, exercise)],
      };
    }));
    this.markDayChanged(dayKey);
  }

  updateExercise(
    dayKey: string,
    exerciseKey: string,
    values: Partial<Pick<WorkoutDayExerciseDraft, 'targetSets' | 'targetReps' | 'restSeconds' | 'targetWeightKg'>>,
  ): void {
    this.days.update((days) => days.map((day) => day.key !== dayKey ? day : {
      ...day,
      exercises: day.exercises.map((exercise) =>
        exercise.key === exerciseKey ? { ...exercise, ...values } : exercise,
      ),
    }));
    this.markDayChanged(dayKey);
  }

  removeExercise(dayKey: string, exerciseKey: string): void {
    this.days.update((days) => days.map((day) => day.key !== dayKey ? day : {
      ...day,
      exercises: day.exercises.filter((exercise) => exercise.key !== exerciseKey),
    }));
    this.markDayChanged(dayKey);
  }

  async save(): Promise<boolean> {
    if (this.saving()) {
      return false;
    }
    if (this.issue() !== null) {
      this.showIssue.set(true);
      return false;
    }
    this.saving.set(true);
    try {
      this.failures.clear();
      await this.saveDays();
      await this.deleteDays();
      if (this.failures.size > 0) {
        this.notifications.error([...this.failures.values()][0]);
        return false;
      }
      await this.load(this.plan()?.id ?? '');
      this.notifications.success('coach.programs.saved');
      return true;
    } finally {
      this.saving.set(false);
    }
  }

  private async saveDays(): Promise<void> {
    for (const day of this.days()) {
      if (day.id !== null && !this.dirtyDayKeys.has(day.key)) {
        continue;
      }
      try {
        await this.writeDay(day);
        this.setSaveState(day.key, 'saved');
      } catch (error) {
        this.failures.set(day.key, error);
        this.setSaveState(day.key, 'failed');
      }
    }
  }

  private async writeDay(day: WorkoutDayDraft): Promise<void> {
    if (day.id === null) {
      const id = await this.service.createDay(toCreateDayRequest(day));
      this.days.update((days) => days.map((item) => item.key === day.key ? { ...item, id } : item));
    } else {
      await this.service.updateDay(day.id, toUpdateDayRequest(day));
    }
    this.dirtyDayKeys.delete(day.key);
  }

  private async deleteDays(): Promise<void> {
    for (const id of [...this.deletedDayIds]) {
      try {
        await this.service.deleteDay(id);
        this.deletedDayIds.delete(id);
      } catch (error) {
        this.failures.set(id, error);
      }
    }
  }

  private setSaveState(key: string, state: WorkoutDaySaveState): void {
    this.saveStates.update((states) => new Map(states).set(key, state));
  }

  private markDayChanged(key: string): void {
    this.saveStates.update((states) => {
      const next = new Map(states);
      next.delete(key);
      return next;
    });
    this.dirtyDayKeys.add(key);
    this.dirty.set(true);
  }
}
