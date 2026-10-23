import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Component, computed, inject } from '@angular/core';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { AppBar } from '@coach/core/ui/app-bar/app-bar';
import { EmptyState } from '@coach/core/ui/empty-state/empty-state';
import { Icon } from '@coach/core/ui/icon/icon';
import { Progress } from '@coach/core/ui/progress/progress';
import { Sheets } from '@coach/core/ui/sheets/sheets.service';
import { Spinner } from '@coach/core/ui/spinner/spinner';
import { canWatch } from '@coach/core/videos/video';
import { VideoPlayerService } from '@coach/core/videos/video-player.service';
import { MAX_PREVIEW_VIDEOS, PREVIEW_NAME_MAX, PreviewVideo } from '../../models/preview-video';
import { PreviewVideosStore } from '../../preview-videos.store';

@Component({
  selector: 'coach-preview-videos-page',
  imports: [
    DragDropModule,
    TranslatePipe,
    MessagePipe,
    AppBar,
    EmptyState,
    Icon,
    Progress,
    Spinner,
  ],
  providers: [PreviewVideosStore],
  templateUrl: './preview-videos-page.html',
  styleUrl: './preview-videos-page.css',
})
export class PreviewVideosPage {
  protected readonly store = inject(PreviewVideosStore);
  private readonly sheets = inject(Sheets);
  private readonly translator = inject(Translator);
  private readonly player = inject(VideoPlayerService);

  protected readonly max = MAX_PREVIEW_VIDEOS;
  protected readonly percent = computed(() => Math.floor((this.store.uploadProgress() ?? 0) * 100));

  constructor() {
    void this.store.load();
  }

  protected chosen(event: Event): void {
    const input = event.target;
    if (input instanceof HTMLInputElement && input.files?.[0]) {
      void this.store.add(input.files[0]);
      input.value = '';
    }
  }

  protected drop(event: CdkDragDrop<readonly PreviewVideo[]>): void {
    void this.store.reorder(event.previousIndex, event.currentIndex);
  }

  protected title(video: PreviewVideo, index: number): string {
    return (
      video.name ||
      this.translator.translate('coachApp.previewVideos.untitled', { number: index + 1 })
    );
  }

  protected status(video: PreviewVideo) {
    return this.store.details()[video.fileId]?.status ?? null;
  }

  protected watchable(video: PreviewVideo): boolean {
    return canWatch(video);
  }

  protected watch(video: PreviewVideo): void {
    this.player.show(video);
  }

  protected async rename(video: PreviewVideo): Promise<void> {
    const t = this.translator.translate.bind(this.translator);
    const name = await this.sheets.prompt({
      title: t('coachApp.previewVideos.nameTitle'),
      initial: video.name,
      hint: t('coachApp.previewVideos.nameHint'),
      actionLabel: t('coachApp.day.videoNameSave'),
      maxLength: PREVIEW_NAME_MAX,
    });
    if (name !== null) {
      await this.store.rename(video.id, name);
    }
  }

  protected async remove(video: PreviewVideo): Promise<void> {
    const t = this.translator.translate.bind(this.translator);
    const confirmed = await this.sheets.confirm({
      title: t('coachApp.previewVideos.deleteTitle'),
      message: t('coachApp.workoutProgram.deleteConfirmMessage'),
      confirmLabel: t('coachApp.previewVideos.delete'),
      cancelLabel: t('coachApp.common.cancel'),
      destructive: true,
    });
    if (confirmed) {
      await this.store.delete(video.id);
    }
  }
}
