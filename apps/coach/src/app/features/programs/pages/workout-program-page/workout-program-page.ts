import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { LocaleStore } from '@core/i18n/locale.store';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { AppBar } from '@coach/core/ui/app-bar/app-bar';
import { Button } from '@coach/core/ui/button/button';
import { EmptyState } from '@coach/core/ui/empty-state/empty-state';
import { NumberedTile } from '@coach/core/ui/numbered-tile/numbered-tile';
import { Progress } from '@coach/core/ui/progress/progress';
import { Sheets } from '@coach/core/ui/sheets/sheets.service';
import { Shimmer } from '@coach/core/ui/shimmer/shimmer';
import { DayEditor } from '../../components/day-editor/day-editor';
import { DayDraft, EMPTY_DAY_DRAFT, dayDraftOf } from '../../models/day-draft';
import { PublishActions } from '../../components/publish-actions/publish-actions';
import { ProgramSummary } from '../../components/program-summary/program-summary';
import { dayReadiness, MAX_PROGRAM_DAYS, WorkoutDay } from '../../models/workout-program';
import { goalText, workoutMeta } from '../../models/program-text';
import { WorkoutProgramStore } from '../../workout-program.store';

@Component({
  selector: 'coach-workout-program-page',
  imports: [
    DayEditor,
    TranslatePipe,
    MessagePipe,
    AppBar,
    Button,
    EmptyState,
    NumberedTile,
    Progress,
    Shimmer,
    PublishActions,
    ProgramSummary,
  ],
  providers: [WorkoutProgramStore],
  templateUrl: './workout-program-page.html',
})
export class WorkoutProgramPage {
  protected readonly store = inject(WorkoutProgramStore);
  private readonly router = inject(Router);
  private readonly sheets = inject(Sheets);
  private readonly translator = inject(Translator);
  protected readonly locale = inject(LocaleStore).locale;

  readonly id = input.required<string>();

  protected readonly editing = signal<{
    readonly dayId: string | null;
    readonly draft: DayDraft;
  } | null>(null);

  protected readonly maxDays = MAX_PROGRAM_DAYS;
  protected readonly goal = computed(() => {
    const program = this.store.program();
    return program === null
      ? null
      : goalText(program, this.translator.translate.bind(this.translator));
  });
  protected readonly meta = computed(() => {
    const program = this.store.program();
    return program === null
      ? ''
      : workoutMeta(program, this.translator.translate.bind(this.translator));
  });

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => void this.store.load(id));
    });
  }

  protected edit(): void {
    void this.router.navigate(['/programs/workout', this.id(), 'edit']);
  }

  protected addDay(): void {
    this.editing.set({ dayId: null, draft: EMPTY_DAY_DRAFT });
  }

  protected openDay(day: WorkoutDay): void {
    this.editing.set({ dayId: day.id, draft: dayDraftOf(day, this.locale()) });
  }

  protected closeEditor(): void {
    this.editing.set(null);
  }

  protected async saveDay(draft: DayDraft): Promise<void> {
    const editing = this.editing();
    if (editing === null) {
      return;
    }
    const saved =
      editing.dayId === null
        ? await this.store.addDay(draft)
        : await this.store.updateDay(editing.dayId, draft);
    if (saved) {
      this.editing.set(null);
    }
  }

  protected dayTitle(day: WorkoutDay, number: number): string {
    return day.title.trim() === ''
      ? this.translator.translate('coachApp.day.number', { number })
      : this.translator.translate('coachApp.day.rowTitle', { number, title: day.title });
  }

  protected daySubtitle(day: WorkoutDay): string {
    return day.isRestDay
      ? this.translator.translate('coachApp.day.restDay')
      : this.translator.translate('coachApp.day.videoCount', { count: day.videos.length });
  }

  protected readiness(day: WorkoutDay): string {
    return dayReadiness(day);
  }

  protected async showMenu(days: readonly WorkoutDay[], index: number): Promise<void> {
    const t = this.translator.translate.bind(this.translator);
    const day = days[index];
    await this.sheets.actions(this.dayTitle(day, index + 1), [
      ...(index > 0
        ? [
            {
              label: t('coachApp.day.moveUp'),
              icon: 'arrow-up' as const,
              run: () => void this.store.moveDay(index, -1),
            },
          ]
        : []),
      ...(index < days.length - 1
        ? [
            {
              label: t('coachApp.day.moveDown'),
              icon: 'arrow-down' as const,
              run: () => void this.store.moveDay(index, 1),
            },
          ]
        : []),
      { label: t('coachApp.common.edit'), icon: 'edit', run: () => this.openDay(day) },
      {
        label: t('coachApp.day.delete'),
        icon: 'close',
        destructive: true,
        run: () => void this.deleteDay(day, index + 1),
      },
    ]);
  }

  protected async togglePublished(published: boolean, name: string): Promise<void> {
    const t = this.translator.translate.bind(this.translator);
    const confirmed = await this.sheets.confirm({
      title: t(
        published
          ? 'coachApp.workoutProgram.unpublishConfirmTitle'
          : 'coachApp.programs.publishConfirmTitle',
      ),
      message: published
        ? t('coachApp.workoutProgram.lastPublishedWarning')
        : t('coachApp.programs.publishConfirmMessage', { name }),
      confirmLabel: t(
        published ? 'coachApp.workoutProgram.unpublish' : 'coachApp.programs.publish',
      ),
      cancelLabel: t('coachApp.common.cancel'),
    });
    if (confirmed) {
      await this.store.togglePublished();
    }
  }

  protected async delete(): Promise<void> {
    const t = this.translator.translate.bind(this.translator);
    const confirmed = await this.sheets.confirm({
      title: t('coachApp.workoutProgram.deleteConfirmTitle'),
      message: t('coachApp.workoutProgram.deleteConfirmMessage'),
      confirmLabel: t('coachApp.workoutProgram.delete'),
      cancelLabel: t('coachApp.common.cancel'),
      destructive: true,
    });
    if (confirmed && (await this.store.delete())) {
      await this.router.navigate(['/programs'], { queryParams: { kind: 'workout' } });
    }
  }

  private async deleteDay(day: WorkoutDay, number: number): Promise<void> {
    const t = this.translator.translate.bind(this.translator);
    const confirmed = await this.sheets.confirm({
      title: t('coachApp.day.deleteConfirmTitle', { day: t('coachApp.day.number', { number }) }),
      message: t('coachApp.workoutProgram.deleteConfirmMessage'),
      confirmLabel: t('coachApp.day.delete'),
      cancelLabel: t('coachApp.common.cancel'),
      destructive: true,
    });
    if (confirmed) {
      await this.store.deleteDay(day.id);
    }
  }
}
