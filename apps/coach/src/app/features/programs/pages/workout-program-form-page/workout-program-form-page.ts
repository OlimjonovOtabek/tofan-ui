import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import {
  EXPERIENCE_LEVELS,
  EXPERIENCE_LEVEL_LABELS,
  placeLabel,
} from '@coach/core/fitness/experience-level';
import { FITNESS_GOALS, FITNESS_GOAL_LABELS } from '@coach/core/fitness/fitness-goal';
import { AppBar } from '@coach/core/ui/app-bar/app-bar';
import { Button } from '@coach/core/ui/button/button';
import { Choice, ChoiceChips } from '@coach/core/ui/choice-chips/choice-chips';
import { EmptyState } from '@coach/core/ui/empty-state/empty-state';
import { NumberedTile } from '@coach/core/ui/numbered-tile/numbered-tile';
import { Note } from '@coach/core/ui/note/note';
import { Segment, Segmented } from '@coach/core/ui/segmented/segmented';
import { Sheets } from '@coach/core/ui/sheets/sheets.service';
import { TextField } from '@coach/core/ui/text-field/text-field';
import { DayEditor } from '../../components/day-editor/day-editor';
import { DayDraft, EMPTY_DAY_DRAFT } from '../../models/day-draft';
import { MAX_PROGRAM_DAYS } from '../../models/workout-program';
import { WorkoutProgramFormStore } from '../../workout-program-form.store';

@Component({
  selector: 'coach-workout-program-form-page',
  imports: [
    TranslatePipe,
    MessagePipe,
    AppBar,
    Button,
    ChoiceChips,
    DayEditor,
    EmptyState,
    Note,
    NumberedTile,
    Segmented,
    TextField,
  ],
  providers: [WorkoutProgramFormStore],
  templateUrl: './workout-program-form-page.html',
})
export class WorkoutProgramFormPage {
  protected readonly store = inject(WorkoutProgramFormStore);
  private readonly router = inject(Router);
  private readonly translator = inject(Translator);
  private readonly sheets = inject(Sheets);

  readonly id = input<string | undefined>(undefined);

  protected readonly editing = signal<{
    readonly index: number | null;
    readonly draft: DayDraft;
  } | null>(null);
  protected readonly maxDays = MAX_PROGRAM_DAYS;

  protected readonly goals = computed<Choice<(typeof FITNESS_GOALS)[number]>[]>(() =>
    FITNESS_GOALS.map((value) => ({
      value,
      label: this.translator.translate(FITNESS_GOAL_LABELS[value]),
    })),
  );
  protected readonly levels = computed<Segment<(typeof EXPERIENCE_LEVELS)[number]>[]>(() =>
    EXPERIENCE_LEVELS.map((value) => ({
      value,
      label: this.translator.translate(EXPERIENCE_LEVEL_LABELS[value]),
    })),
  );
  protected readonly places = computed<Segment<boolean>[]>(() => [
    { value: false, label: this.translator.translate(placeLabel(false)) },
    { value: true, label: this.translator.translate(placeLabel(true)) },
  ]);

  constructor() {
    effect(() => {
      const id = this.id() ?? null;
      untracked(() => void this.store.load(id));
    });
  }

  protected dayTitle(day: DayDraft, number: number): string {
    return day.title.trim() === ''
      ? this.translator.translate('coachApp.day.number', { number })
      : this.translator.translate('coachApp.day.rowTitle', { number, title: day.title });
  }

  protected openDay(index: number | null): void {
    this.editing.set({ index, draft: index === null ? EMPTY_DAY_DRAFT : this.store.days()[index] });
  }

  protected saveDay(draft: DayDraft): void {
    const editing = this.editing();
    if (editing !== null) {
      this.store.saveDay(editing.index, draft);
      this.editing.set(null);
    }
  }

  protected async dayMenu(day: DayDraft, index: number): Promise<void> {
    const t = this.translator.translate.bind(this.translator);
    await this.sheets.actions(this.dayTitle(day, index + 1), [
      { label: t('coachApp.common.edit'), icon: 'edit', run: () => this.openDay(index) },
      {
        label: t('coachApp.day.delete'),
        icon: 'close',
        destructive: true,
        run: () => this.store.removeDay(index),
      },
    ]);
  }

  protected closeEditor(): void {
    this.editing.set(null);
  }

  protected back(): string {
    return this.id() === undefined ? '/programs' : `/programs/workout/${this.id()}`;
  }

  protected async submit(): Promise<void> {
    const id = await this.store.submit();
    if (id !== null) {
      await this.router.navigate(['/programs/workout', id], { replaceUrl: true });
    }
  }
}
