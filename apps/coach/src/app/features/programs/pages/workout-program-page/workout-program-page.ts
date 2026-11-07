import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
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
import { WorkoutProgramConfirmations } from './workout-program-confirmations';

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
  providers: [WorkoutProgramStore, WorkoutProgramConfirmations],
  templateUrl: './workout-program-page.html',
})
export class WorkoutProgramPage {
  protected readonly store = inject(WorkoutProgramStore);
  private readonly router = inject(Router);
  private readonly sheets = inject(Sheets);
  private readonly confirmations = inject(WorkoutProgramConfirmations);
  private readonly translator = inject(Translator);
  protected readonly locale = inject(LocaleStore).locale;

  readonly id = input.required<string>();

  protected readonly editing = signal<{
    readonly dayId: string | null;
    readonly draft: DayDraft;
  } | null>(null);

  protected readonly maxDays = MAX_PROGRAM_DAYS;
  private readonly dayEditor = viewChild(DayEditor);
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

  protected closeEditor(): Promise<boolean> {
    return this.canLeave();
  }

  async canLeave(): Promise<boolean> {
    const editor = this.dayEditor();
    if (editor === undefined) {
      return true;
    }
    const leaving = await editor.leaving();
    if (leaving.kind === 'stay') {
      return false;
    }
    if (leaving.kind === 'save') {
      return this.saveDay(leaving.draft);
    }
    this.editing.set(null);
    return true;
  }

  protected async saveDay(draft: DayDraft): Promise<boolean> {
    const editing = this.editing();
    if (editing === null) {
      return true;
    }
    const saved =
      editing.dayId === null
        ? await this.store.addDay(draft)
        : await this.store.updateDay(editing.dayId, draft);
    if (saved) {
      this.editing.set(null);
    }
    return saved;
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
    if (await this.confirmations.togglePublished(published, name)) {
      await this.store.togglePublished();
    }
  }

  protected async delete(): Promise<void> {
    if ((await this.confirmations.deleteProgram()) && (await this.store.delete())) {
      await this.router.navigate(['/programs'], { queryParams: { kind: 'workout' } });
    }
  }

  private async deleteDay(day: WorkoutDay, number: number): Promise<void> {
    if (await this.confirmations.deleteDay(number)) {
      await this.store.deleteDay(day.id);
    }
  }
}
