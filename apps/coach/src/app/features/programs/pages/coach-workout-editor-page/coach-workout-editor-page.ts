import { Message } from '@openng/optimus-ui/message';
import { Skeleton } from '@openng/optimus-ui/skeleton';
import { ButtonDirective } from '@openng/optimus-ui/button';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, CanDeactivateFn, RouterLink } from '@angular/router';
import { ConfirmDialogService } from '@core/feedback/confirmation.service';
import { MessagePipe } from '@core/i18n/message.pipe';
import { Translator } from '@core/i18n/translator';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { CoachExercisePicker } from '../../components/coach-exercise-picker/coach-exercise-picker';
import { CoachSaveBar } from '../../components/coach-save-bar/coach-save-bar';
import { CoachWorkoutDayDialog } from '../../components/coach-workout-day-dialog/coach-workout-day-dialog';
import { CoachWorkoutDayEditor } from '../../components/coach-workout-day-editor/coach-workout-day-editor';
import { CoachWorkoutDayList } from '../../components/coach-workout-day-list/coach-workout-day-list';
import { CoachWorkoutEditorStore } from '../../coach-workout-editor.store';
import { FITNESS_GOAL_LABELS } from '@coach/core/fitness/fitness-goal';
import { EXPERIENCE_LEVEL_LABELS } from '../../models/coach-program-attributes';
import { WorkoutDayDraft, WorkoutDaySettings } from '../../models/coach-workout-draft';

type DayDialogMode = 'add' | 'edit';

@Component({
  selector: 'coach-workout-editor-page',
  imports: [
    Message,
    Skeleton,
    ButtonDirective,
    RouterLink,
    MessagePipe,
    TranslatePipe,
    CoachExercisePicker,
    CoachSaveBar,
    CoachWorkoutDayDialog,
    CoachWorkoutDayEditor,
    CoachWorkoutDayList,
  ],
  providers: [CoachWorkoutEditorStore],
  templateUrl: './coach-workout-editor-page.html',
  styleUrl: './coach-workout-editor-page.css',
})
export class CoachWorkoutEditorPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly confirmations = inject(ConfirmDialogService);
  private readonly translator = inject(Translator);

  protected readonly store = inject(CoachWorkoutEditorStore);
  protected readonly selectedKey = signal<string | null>(null);
  protected readonly dayOpenOnMobile = signal(false);
  protected readonly dayDialog = signal<DayDialogMode | null>(null);
  protected readonly pickerDayKey = signal<string | null>(null);
  protected readonly selectedDay = computed<WorkoutDayDraft | null>(() => {
    const days = this.store.days();
    return days.find((day) => day.key === this.selectedKey()) ?? days[0] ?? null;
  });

  protected readonly planSummary = computed(() => {
    const plan = this.store.plan();
    if (plan === null) {
      return '';
    }
    const goal = this.translator.translate(FITNESS_GOAL_LABELS[plan.goal]);
    const level = this.translator.translate(EXPERIENCE_LEVEL_LABELS[plan.experienceLevel]);
    return `${goal} · ${level}`;
  });

  ngOnInit(): void {
    const id = this.planId();
    if (id !== null) {
      void this.store.load(id);
    }
  }

  async canLeave(): Promise<boolean> {
    if (!this.store.dirty()) {
      return true;
    }
    return this.confirmations.confirm({ key: 'coach.programs.unsavedWarning' });
  }

  protected selectDay(key: string): void {
    this.selectedKey.set(key);
    this.dayOpenOnMobile.set(true);
  }

  protected saveDay(values: WorkoutDaySettings): void {
    const day = this.selectedDay();
    if (this.dayDialog() === 'edit' && day !== null) {
      this.store.updateDay(day.key, values);
    } else {
      const key = this.store.addDay(values.title, values.dayOfWeek, values.splitType, values.isRestDay);
      if (key !== null) {
        this.selectDay(key);
      }
    }
    this.dayDialog.set(null);
  }

  protected async removeSelectedDay(): Promise<void> {
    const day = this.selectedDay();
    if (day === null || !(await this.confirmations.confirmDelete(day.title))) {
      return;
    }
    this.store.removeDay(day.key);
    this.selectedKey.set(null);
    this.dayOpenOnMobile.set(false);
    this.dayDialog.set(null);
  }

  protected async discard(): Promise<void> {
    const id = this.planId();
    if (id !== null && (await this.confirmations.confirm({ key: 'coach.programs.unsavedWarning' }))) {
      await this.store.load(id);
    }
  }

  private planId(): string | null {
    return this.route.snapshot.paramMap.get('id');
  }
}

export const canDeactivateWorkoutEditor: CanDeactivateFn<CoachWorkoutEditorPage> = (component) =>
  component.canLeave();
