import { Dialog } from '@openng/optimus-ui/dialog';
import { Message } from '@openng/optimus-ui/message';
import { Skeleton } from '@openng/optimus-ui/skeleton';
import { ButtonDirective } from '@openng/optimus-ui/button';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { ConfirmDialogService } from '@core/feedback/confirmation.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { LocaleStore } from '@core/i18n/locale.store';
import { EQUIPMENT_TYPE_LABELS, MUSCLE_GROUP_LABELS } from '@shared/models/exercise-attribute-labels';
import { CoachExercise, CoachExerciseDraft } from '../../models/coach-exercise';
import { CoachExercisesStore } from '../../coach-exercises.store';
import { CoachExerciseEditor } from '../../components/coach-exercise-editor/coach-exercise-editor';
import { MessagePipe } from '@core/i18n/message.pipe';
import { Translator } from '@core/i18n/translator';
import { CoachContentHeader } from '../../components/coach-content-header/coach-content-header';

@Component({
  selector: 'coach-exercises-page',
  imports: [
    Dialog,
    Message,
    Skeleton,
    ButtonDirective,
    TranslatePipe,
    MessagePipe,
    CoachExerciseEditor,
    CoachContentHeader,
  ],
  providers: [CoachExercisesStore],
  templateUrl: './coach-exercises-page.html',
  styleUrl: '../coach-library-page.css',
})
export class CoachExercisesPage implements OnInit {
  protected readonly locale = inject(LocaleStore);
  protected readonly store = inject(CoachExercisesStore);
  protected readonly editingExercise = signal<CoachExercise | null>(null);
  protected readonly editorVisible = signal(false);
  protected readonly videoFileId = signal<string | null>(null);
  private readonly confirmations = inject(ConfirmDialogService);
  private readonly translator = inject(Translator);

  ngOnInit(): void {
    void this.load();
  }

  protected async load(): Promise<void> {
    await this.store.load();
  }

  protected async clearSearch(): Promise<void> {
    this.store.searchText.set('');
    await this.load();
  }

  protected searchChanged(event: Event): void {
    const input = event.currentTarget;
    if (input instanceof HTMLInputElement) {
      this.store.searchText.set(input.value);
    }
  }

  protected nameOf(item: CoachExercise): string {
    const locale = this.locale.locale();
    return locale === 'ru' ? item.nameRu : locale === 'uz' ? item.nameUz : item.name;
  }

  protected summaryOf(item: CoachExercise): string {
    const muscle = this.translator.translate(MUSCLE_GROUP_LABELS[item.muscleGroup]);
    const equipment = this.translator.translate(EQUIPMENT_TYPE_LABELS[item.equipmentType]);
    return `${muscle} · ${equipment}`;
  }

  protected addExercise(): void {
    this.editingExercise.set(null);
    this.videoFileId.set(null);
    this.editorVisible.set(true);
  }

  protected editExercise(exercise: CoachExercise): void {
    this.editingExercise.set(exercise);
    this.videoFileId.set(exercise.videoFileId);
    this.editorVisible.set(true);
  }

  protected async saveExercise(draft: CoachExerciseDraft): Promise<void> {
    if (await this.store.save(this.editingExercise()?.id ?? null, draft)) {
      this.editorVisible.set(false);
    }
  }

  protected async uploadVideo(file: File): Promise<void> {
    const videoFileId = await this.store.uploadVideo(file);
    if (videoFileId !== null) {
      this.videoFileId.set(videoFileId);
    }
  }

  protected async closeEditor(): Promise<void> {
    if (this.store.uploadProgress() !== null) {
      const confirmed = await this.confirmations.confirm({ key: 'coach.workspace.uploadLeave' });
      if (!confirmed) {
        return;
      }
      this.store.cancelVideoUpload();
    }
    this.editorVisible.set(false);
  }

  protected cancelVideoUpload(): void {
    this.store.cancelVideoUpload();
  }

  async canLeave(): Promise<boolean> {
    if (this.store.uploadProgress() === null) {
      return true;
    }
    const confirmed = await this.confirmations.confirm({ key: 'coach.workspace.uploadLeave' });
    if (confirmed) {
      this.store.cancelVideoUpload();
    }
    return confirmed;
  }
}

export const canDeactivateCoachExercises: CanDeactivateFn<CoachExercisesPage> = (component) =>
  component.canLeave();
