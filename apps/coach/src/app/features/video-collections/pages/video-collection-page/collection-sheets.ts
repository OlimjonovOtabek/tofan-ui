import { Injectable, inject } from '@angular/core';
import { TranslationKey, TranslationParams } from '@core/i18n/dictionary';
import { Translator } from '@core/i18n/translator';
import { TextPair } from '@coach/core/ui/sheets/sheet-request';
import { Sheets } from '@coach/core/ui/sheets/sheets.service';
import {
  COLLECTION_DESCRIPTION_MAX,
  COLLECTION_TITLE_MAX,
  COLLECTION_VIDEO_NOTE_MAX,
  COLLECTION_VIDEO_TITLE_MAX,
  CollectionVideo,
  VideoCollection,
} from '../../models/video-collection';

@Injectable()
export class CollectionSheets {
  private readonly sheets = inject(Sheets);
  private readonly translator = inject(Translator);

  videoTitle(video: CollectionVideo, index: number): string {
    const name = video.title || this.t('coachApp.day.exerciseNumber', { number: index + 1 });
    return this.t('coachApp.day.videoNumbered', { number: index + 1, name });
  }

  editCollection(collection: VideoCollection): Promise<TextPair | null> {
    return this.sheets.pair({
      title: this.t('coachApp.videoCollections.editTitle'),
      initial: { title: collection.title, text: collection.description },
      titleHint: this.t('coachApp.videoCollections.titleHint'),
      textHint: this.t('coachApp.videoCollections.descriptionHint'),
      actionLabel: this.t('coachApp.day.videoNameSave'),
      titleMaxLength: COLLECTION_TITLE_MAX,
      textMaxLength: COLLECTION_DESCRIPTION_MAX,
      titleRequired: true,
    });
  }

  editVideo(video: CollectionVideo): Promise<TextPair | null> {
    return this.sheets.pair({
      title: this.t('coachApp.videoCollections.videoEditTitle'),
      initial: { title: video.title, text: video.note },
      titleHint: this.t('coachApp.videoCollections.videoTitleHint'),
      textHint: this.t('coachApp.videoCollections.videoNoteHint'),
      actionLabel: this.t('coachApp.day.videoNameSave'),
      titleMaxLength: COLLECTION_VIDEO_TITLE_MAX,
      textMaxLength: COLLECTION_VIDEO_NOTE_MAX,
    });
  }

  confirmDeleteCollection(): Promise<boolean> {
    return this.sheets.confirm({
      title: this.t('coachApp.videoCollections.deleteTitle'),
      message: this.t('coachApp.videoCollections.deleteMessage'),
      confirmLabel: this.t('coachApp.videoCollections.delete'),
      cancelLabel: this.t('coachApp.common.cancel'),
      destructive: true,
    });
  }

  confirmDeleteVideo(): Promise<boolean> {
    return this.sheets.confirm({
      title: this.t('coachApp.previewVideos.deleteTitle'),
      message: this.t('coachApp.workoutProgram.deleteConfirmMessage'),
      confirmLabel: this.t('coachApp.previewVideos.delete'),
      cancelLabel: this.t('coachApp.common.cancel'),
      destructive: true,
    });
  }

  private t(key: TranslationKey, params?: TranslationParams): string {
    return this.translator.translate(key, params);
  }
}
