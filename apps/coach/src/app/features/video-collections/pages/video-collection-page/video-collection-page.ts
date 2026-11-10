import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Component, effect, inject, input, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { AppBar } from '@coach/core/ui/app-bar/app-bar';
import { Button } from '@coach/core/ui/button/button';
import { EmptyState } from '@coach/core/ui/empty-state/empty-state';
import { Sheets } from '@coach/core/ui/sheets/sheets.service';
import { Spinner } from '@coach/core/ui/spinner/spinner';
import { VideoPlayerService } from '@coach/core/videos/video-player.service';
import { VideoStatusesStore } from '@coach/core/videos/video-statuses.store';
import { VIDEO_FILE_ACCEPT } from '@coach/core/videos/video-upload';
import { VideoUploadCard } from '@coach/core/videos/video-upload-card';
import { CollectionHeader } from '../../components/collection-header/collection-header';
import { CollectionVideoTile } from '../../components/collection-video-tile/collection-video-tile';
import {
  COLLECTIONS_LINK,
  CollectionVideo,
  MAX_COLLECTION_VIDEOS,
} from '../../models/video-collection';
import { VideoCollectionStore } from '../../video-collection.store';
import { CollectionSheets } from './collection-sheets';

@Component({
  selector: 'coach-video-collection-page',
  imports: [
    DragDropModule,
    TranslatePipe,
    MessagePipe,
    AppBar,
    Button,
    CollectionHeader,
    CollectionVideoTile,
    EmptyState,
    Spinner,
    VideoUploadCard,
  ],
  providers: [VideoCollectionStore, VideoStatusesStore, CollectionSheets],
  templateUrl: './video-collection-page.html',
  styleUrl: './video-collection-page.css',
})
export class VideoCollectionPage {
  protected readonly store = inject(VideoCollectionStore);
  protected readonly statuses = inject(VideoStatusesStore);
  private readonly dialogs = inject(CollectionSheets);
  private readonly sheets = inject(Sheets);
  private readonly translator = inject(Translator);
  private readonly player = inject(VideoPlayerService);
  private readonly router = inject(Router);

  readonly collectionId = input.required<string>();

  protected readonly max = MAX_COLLECTION_VIDEOS;
  protected readonly accept = VIDEO_FILE_ACCEPT;
  protected readonly backLink = COLLECTIONS_LINK;

  constructor() {
    effect(() => {
      const id = this.collectionId();
      untracked(() => void this.store.load(id));
    });
  }

  protected titleOf(video: CollectionVideo, index: number): string {
    return this.dialogs.videoTitle(video, index);
  }

  protected chosen(event: Event): void {
    const input = event.target;
    if (input instanceof HTMLInputElement && input.files?.[0]) {
      this.store.addVideo(input.files[0]);
      input.value = '';
    }
  }

  protected drop(event: CdkDragDrop<readonly CollectionVideo[]>): void {
    void this.store.reorder(event.previousIndex, event.currentIndex);
  }

  protected watch(video: CollectionVideo): void {
    this.player.show(video);
  }

  protected async edit(): Promise<void> {
    const collection = this.store.collection();
    const text = collection === null ? null : await this.dialogs.editCollection(collection);
    if (text !== null) {
      await this.store.update(text);
    }
  }

  protected async more(video: CollectionVideo, index: number): Promise<void> {
    const t = this.translator.translate.bind(this.translator);
    await this.sheets.actions(this.titleOf(video, index), [
      { label: t('coachApp.day.videoWatch'), icon: 'play', run: () => this.watch(video) },
      { label: t('coachApp.common.edit'), icon: 'edit', run: () => void this.editVideo(video) },
      {
        label: t('coachApp.day.videoRemove'),
        icon: 'trash',
        destructive: true,
        run: () => void this.removeVideo(video),
      },
    ]);
  }

  protected async remove(): Promise<void> {
    if (await this.dialogs.confirmDeleteCollection()) {
      if (await this.store.delete()) {
        await this.router.navigateByUrl(COLLECTIONS_LINK);
      }
    }
  }

  private async editVideo(video: CollectionVideo): Promise<void> {
    const text = await this.dialogs.editVideo(video);
    if (text !== null) {
      await this.store.updateVideo(video.id, text);
    }
  }

  private async removeVideo(video: CollectionVideo): Promise<void> {
    if (await this.dialogs.confirmDeleteVideo()) {
      await this.store.deleteVideo(video.id);
    }
  }
}
