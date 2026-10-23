import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Component, computed, inject, input, output } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { Button } from '@coach/core/ui/button/button';
import { Icon } from '@coach/core/ui/icon/icon';
import { Note } from '@coach/core/ui/note/note';
import { Progress } from '@coach/core/ui/progress/progress';
import { Sheets } from '@coach/core/ui/sheets/sheets.service';
import { TextField } from '@coach/core/ui/text-field/text-field';
import { VideoStatusTag } from '@coach/core/videos/video-status-tag';
import { VideoPlayerService } from '@coach/core/videos/video-player.service';
import { canWatch, formatVideoDuration } from '@coach/core/videos/video';
import { DayEditorStore } from '../../day-editor.store';
import {
  DAY_DESCRIPTION_MAX,
  DayDraft,
  DayVideoDraft,
  VIDEO_NAME_MAX,
  isUploading,
  uploadedCount,
} from '../../models/day-draft';

@Component({
  selector: 'coach-day-editor',
  imports: [DragDropModule, TranslatePipe, Button, Icon, Note, Progress, TextField, VideoStatusTag],
  providers: [DayEditorStore],
  templateUrl: './day-editor.html',
  styleUrl: './day-editor.css',
})
export class DayEditor {
  protected readonly store = inject(DayEditorStore);
  private readonly sheets = inject(Sheets);
  private readonly translator = inject(Translator);
  private readonly player = inject(VideoPlayerService);

  readonly day = input.required<DayDraft>();
  readonly published = input(false);
  readonly saved = output<DayDraft>();

  protected readonly descriptionMax = DAY_DESCRIPTION_MAX;
  protected readonly uploaded = computed(() => uploadedCount(this.store.draft()));

  constructor() {
    queueMicrotask(() => this.store.init(this.day()));
  }

  protected chosen(event: Event): void {
    const input = event.target;
    if (input instanceof HTMLInputElement) {
      Array.from(input.files ?? []).forEach((file) => this.store.addFile(file));
      input.value = '';
    }
  }

  protected drop(event: CdkDragDrop<readonly DayVideoDraft[]>): void {
    this.store.reorder(event.previousIndex, event.currentIndex);
  }

  protected uploading(video: DayVideoDraft): boolean {
    return isUploading(video);
  }

  protected percent(video: DayVideoDraft): number {
    return Math.floor((video.progress ?? 0) * 100);
  }

  protected duration(video: DayVideoDraft): string | null {
    const seconds =
      video.fileId === null ? null : (this.store.details()[video.fileId]?.durationSeconds ?? null);
    return seconds === null ? null : formatVideoDuration(seconds);
  }

  protected status(video: DayVideoDraft) {
    return video.fileId === null ? null : (this.store.details()[video.fileId]?.status ?? null);
  }

  protected displayName(video: DayVideoDraft, index: number): string {
    const name =
      video.name.trim() === ''
        ? this.translator.translate('coachApp.day.exerciseNumber', { number: index + 1 })
        : video.name;
    return this.translator.translate('coachApp.day.videoNumbered', { number: index + 1, name });
  }

  protected watchable(video: DayVideoDraft): boolean {
    return canWatch(video);
  }

  protected watch(video: DayVideoDraft): void {
    this.player.show(video);
  }

  protected async menu(video: DayVideoDraft, index: number): Promise<void> {
    const t = this.translator.translate.bind(this.translator);
    await this.sheets.actions(this.displayName(video, index), [
      ...(this.watchable(video)
        ? [
            {
              label: t('coachApp.day.videoWatch'),
              icon: 'play' as const,
              run: () => this.watch(video),
            },
          ]
        : []),
      { label: t('coachApp.day.videoRename'), icon: 'edit', run: () => void this.rename(video) },
      {
        label: t('coachApp.day.videoRemove'),
        icon: 'close',
        destructive: true,
        run: () => this.store.remove(video.key),
      },
    ]);
  }

  protected save(): void {
    if (this.store.canSave()) {
      this.saved.emit(this.store.draft());
    }
  }

  private async rename(video: DayVideoDraft): Promise<void> {
    const t = this.translator.translate.bind(this.translator);
    const name = await this.sheets.prompt({
      title: t('coachApp.day.videoNameTitle'),
      initial: video.name,
      hint: t('coachApp.day.videoNameHint'),
      actionLabel: t('coachApp.day.videoNameSave'),
      maxLength: VIDEO_NAME_MAX,
    });
    if (name !== null) {
      this.store.rename(video.key, name);
    }
  }
}
