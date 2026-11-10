import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { AppBar } from '@coach/core/ui/app-bar/app-bar';
import { Button } from '@coach/core/ui/button/button';
import { EmptyState } from '@coach/core/ui/empty-state/empty-state';
import { Icon } from '@coach/core/ui/icon/icon';
import { EMPTY_TEXT_PAIR } from '@coach/core/ui/sheets/sheet-request';
import { Sheets } from '@coach/core/ui/sheets/sheets.service';
import { Spinner } from '@coach/core/ui/spinner/spinner';
import { CollectionStatusTag } from '../../components/collection-status-tag/collection-status-tag';
import {
  COLLECTION_DESCRIPTION_MAX,
  COLLECTION_TITLE_MAX,
  MAX_COLLECTIONS,
  VideoCollectionSummary,
  collectionLink,
} from '../../models/video-collection';
import { VideoCollectionsStore } from '../../video-collections.store';

@Component({
  selector: 'coach-video-collections-page',
  imports: [
    DragDropModule,
    TranslatePipe,
    MessagePipe,
    AppBar,
    Button,
    CollectionStatusTag,
    EmptyState,
    Icon,
    Spinner,
  ],
  providers: [VideoCollectionsStore],
  templateUrl: './video-collections-page.html',
  styleUrl: './video-collections-page.css',
})
export class VideoCollectionsPage {
  protected readonly store = inject(VideoCollectionsStore);
  private readonly sheets = inject(Sheets);
  private readonly translator = inject(Translator);
  private readonly router = inject(Router);

  protected readonly max = MAX_COLLECTIONS;

  constructor() {
    void this.store.load();
  }

  protected async create(): Promise<void> {
    const t = this.translator.translate.bind(this.translator);
    const text = await this.sheets.pair({
      title: t('coachApp.videoCollections.new'),
      initial: EMPTY_TEXT_PAIR,
      titleHint: t('coachApp.videoCollections.titleHint'),
      textHint: t('coachApp.videoCollections.descriptionHint'),
      actionLabel: t('coachApp.videoCollections.create'),
      titleMaxLength: COLLECTION_TITLE_MAX,
      textMaxLength: COLLECTION_DESCRIPTION_MAX,
      titleRequired: true,
    });
    if (text === null) {
      return;
    }
    const id = await this.store.create(text);
    if (id !== null) {
      this.open(id);
    }
  }

  protected open(id: string): void {
    void this.router.navigateByUrl(collectionLink(id));
  }

  protected drop(event: CdkDragDrop<readonly VideoCollectionSummary[]>): void {
    void this.store.reorder(event.previousIndex, event.currentIndex);
  }
}
