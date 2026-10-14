import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Button, ButtonDirective } from '@openng/optimus-ui/button';
import { Message } from '@openng/optimus-ui/message';
import { Skeleton } from '@openng/optimus-ui/skeleton';
import { ConfirmDialogService, ConfirmText } from '@core/feedback/confirmation.service';
import { formatCalendarDate } from '@core/i18n/date-format';
import { LocaleStore } from '@core/i18n/locale.store';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { CoachProgramsStore } from '../../coach-programs.store';
import {
  CoachMealCreateDialog,
  MealProgramDates,
} from '../../components/coach-meal-create-dialog/coach-meal-create-dialog';
import { CoachProgramReadiness } from '../../components/coach-program-readiness/coach-program-readiness';
import { CoachPublishedPrograms } from '../../components/coach-published-programs/coach-published-programs';
import { CoachWorkoutCreateDialog } from '../../components/coach-workout-create-dialog/coach-workout-create-dialog';
import {
  ProgramStatusFilter,
  matchesProgramFilter,
  mealRangeLabel,
} from '../../models/coach-program-labels';
import { FITNESS_GOAL_LABELS, FitnessGoal } from '@coach/core/fitness/fitness-goal';
import { NewWorkoutProgram, WorkoutProgram } from '../../models/coach-program';
import { MealProgramSummary } from '../../services/coach-program.dto';

type ProgramEditor = 'workout' | 'meal' | null;
type ProgramTab = 'workouts' | 'meals';

@Component({
  selector: 'coach-programs-page',
  imports: [
    Button,
    ButtonDirective,
    CoachMealCreateDialog,
    CoachProgramReadiness,
    CoachPublishedPrograms,
    CoachWorkoutCreateDialog,
    Message,
    MessagePipe,
    RouterLink,
    Skeleton,
    TranslatePipe,
  ],
  providers: [CoachProgramsStore],
  templateUrl: './coach-programs-page.html',
  styleUrl: './coach-programs-page.css',
})
export class CoachProgramsPage implements OnInit {
  protected readonly store = inject(CoachProgramsStore);
  private readonly router = inject(Router);
  private readonly confirmations = inject(ConfirmDialogService);
  private readonly translator = inject(Translator);
  private readonly locale = inject(LocaleStore);
  protected readonly editor = signal<ProgramEditor>(null);
  protected readonly tab = signal<ProgramTab>('workouts');
  protected readonly status = signal<ProgramStatusFilter>('all');
  protected readonly search = signal('');
  protected readonly filteredWorkouts = computed(() =>
    this.store.workouts().filter((program) => this.matchesWorkout(program)),
  );
  protected readonly filteredMeals = computed(() =>
    this.store.meals().filter((program) => this.matchesMeal(program)),
  );

  ngOnInit(): void {
    void this.store.load();
  }

  protected createWorkout(): void {
    this.editor.set('workout');
  }

  protected createMeal(): void {
    this.editor.set('meal');
  }

  protected async saveWorkout(program: NewWorkoutProgram): Promise<void> {
    const id = await this.store.createWorkout(program);
    if (id !== null) {
      this.editor.set(null);
      await this.router.navigate(['/programs/workout', id]);
    }
  }

  protected async saveMeal(dates: MealProgramDates): Promise<void> {
    const id = await this.store.createMeal({ ...dates, meals: [] });
    if (id !== null) {
      this.editor.set(null);
      await this.router.navigate(['/programs/meal', id]);
    }
  }

  protected async publishWorkout(program: WorkoutProgram): Promise<void> {
    const previous = this.store.publishedWorkout();
    const accepted = await this.confirmPublication(program.name, previous?.name ?? null);
    if (accepted) {
      await this.store.publishWorkout(program);
    }
  }

  protected async publishMeal(program: MealProgramSummary): Promise<void> {
    const previous = this.store.publishedMeal();
    const accepted = await this.confirmPublication(
      this.mealRange(program),
      previous === null ? null : this.mealRange(previous),
    );
    if (accepted) {
      await this.store.publishMeal(program);
    }
  }

  private confirmPublication(next: string, previous: string | null): Promise<boolean> {
    const message: ConfirmText =
      previous === null
        ? { key: 'coach.programs.firstPublishConfirm', params: { next } }
        : { key: 'coach.programs.replaceConfirmNamed', params: { next, previous } };
    return this.confirmations.confirm(message, 'coach.programs.publish');
  }

  protected selectTab(tab: ProgramTab): void {
    this.tab.set(tab);
    this.status.set('all');
    this.search.set('');
  }

  protected statusChanged(event: Event): void {
    const input = event.currentTarget;
    if (input instanceof HTMLSelectElement) {
      this.status.set(input.value as ProgramStatusFilter);
    }
  }

  protected goalLabel(goal: FitnessGoal): string {
    return this.translator.translate(FITNESS_GOAL_LABELS[goal]);
  }

  protected searchChanged(event: Event): void {
    const input = event.currentTarget;
    if (input instanceof HTMLInputElement) {
      this.search.set(input.value);
    }
  }

  protected mealRange(program: MealProgramSummary): string {
    return mealRangeLabel(program, (date) => formatCalendarDate(date, this.locale.locale()));
  }

  private matchesWorkout(program: WorkoutProgram): boolean {
    return matchesProgramFilter(program.name, program.isPublished, this.search(), this.status());
  }

  private matchesMeal(program: MealProgramSummary): boolean {
    return matchesProgramFilter(this.mealRange(program), program.isPublished, this.search(), this.status());
  }
}
