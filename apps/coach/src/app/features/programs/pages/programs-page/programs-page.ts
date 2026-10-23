import { Component, computed, effect, inject, input, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { Button } from '@coach/core/ui/button/button';
import { EmptyState } from '@coach/core/ui/empty-state/empty-state';
import { Note } from '@coach/core/ui/note/note';
import { Segment, Segmented } from '@coach/core/ui/segmented/segmented';
import { Shimmer } from '@coach/core/ui/shimmer/shimmer';
import { Sheets } from '@coach/core/ui/sheets/sheets.service';
import { ProgramCard } from '../../components/program-card/program-card';
import { MealProgram } from '../../models/meal-program';
import { PROGRAM_KIND_PARAM, ProgramKind, toProgramKind } from '../../models/program-kind';
import { goalText, mealProgramTitle, workoutMeta } from '../../models/program-text';
import { WorkoutProgram } from '../../models/workout-program';
import { ProgramsListStore } from '../../programs-list.store';

interface ProgramRow {
  readonly id: string;
  readonly title: string;
  readonly goal: string | null;
  readonly meta: string;
  readonly published: boolean;
}

@Component({
  selector: 'coach-programs-page',
  imports: [TranslatePipe, MessagePipe, Button, EmptyState, Note, Segmented, Shimmer, ProgramCard],
  providers: [ProgramsListStore],
  templateUrl: './programs-page.html',
})
export class ProgramsPage {
  protected readonly store = inject(ProgramsListStore);
  private readonly router = inject(Router);
  private readonly translator = inject(Translator);
  private readonly sheets = inject(Sheets);

  readonly kind = input<string | undefined>(undefined);

  protected readonly activeKind = computed(() => toProgramKind(this.kind()));
  protected readonly segments = computed<Segment<ProgramKind>[]>(() => [
    { value: 'workout', label: this.translator.translate('coachApp.programs.kindWorkout') },
    { value: 'meal', label: this.translator.translate('coachApp.programs.kindMeal') },
  ]);
  protected readonly rows = computed<ProgramRow[] | null>(() =>
    this.activeKind() === 'workout' ? this.workoutRows() : this.mealRows(),
  );
  protected readonly error = computed(() =>
    this.activeKind() === 'workout' ? this.store.workoutsError() : this.store.mealsError(),
  );

  constructor() {
    effect(() => {
      const kind = this.activeKind();
      untracked(() => void this.store.load(kind));
    });
  }

  protected selectKind(kind: ProgramKind): void {
    void this.router.navigate([], {
      queryParams: { [PROGRAM_KIND_PARAM]: kind },
      replaceUrl: true,
    });
  }

  protected open(id: string): void {
    void this.router.navigate(['/programs', this.activeKind(), id]);
  }

  protected create(): void {
    void this.router.navigate(['/programs', this.activeKind(), 'new']);
  }

  protected async publish(row: ProgramRow): Promise<void> {
    const confirmed = await this.sheets.confirm({
      title: this.translator.translate('coachApp.programs.publishConfirmTitle'),
      message: this.translator.translate('coachApp.programs.publishConfirmMessage', {
        name: row.title,
      }),
      confirmLabel: this.translator.translate('coachApp.programs.publish'),
      cancelLabel: this.translator.translate('coachApp.common.cancel'),
    });
    if (confirmed) {
      await this.store.publish(this.activeKind(), row.id);
    }
  }

  private workoutRows(): ProgramRow[] | null {
    const translate = this.translator.translate.bind(this.translator);
    return (
      this.store.workouts()?.map((program: WorkoutProgram) => ({
        id: program.id,
        title: program.name || translate('coachApp.common.unknown'),
        goal: goalText(program, translate),
        meta: workoutMeta(program, translate),
        published: program.isPublished,
      })) ?? null
    );
  }

  private mealRows(): ProgramRow[] | null {
    const translate = this.translator.translate.bind(this.translator);
    return (
      this.store.meals()?.map((program: MealProgram) => ({
        id: program.id,
        title: mealProgramTitle(program, translate),
        goal: goalText(program, translate),
        meta: translate('coachApp.programs.mealsCount', { count: program.mealCount }),
        published: program.isPublished,
      })) ?? null
    );
  }
}
