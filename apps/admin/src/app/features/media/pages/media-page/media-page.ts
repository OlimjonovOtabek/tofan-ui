import { Component, computed, inject, signal } from '@angular/core';
import { PageRequest } from '@shared/models/page';
import { StoredFile } from '../../models/stored-file';
import { DataTable, DataTableColumn } from '@shared/components/data-table/data-table';
import { ConfirmDialogService } from '@core/feedback/confirmation.service';
import { ClipboardService } from '@core/feedback/clipboard.service';
import { formatFileSize } from '@shared/utils/file-size';
import { FILE_CATEGORY_LABELS } from '../../models/file-labels';
import { MediaStore } from '../../media.store';
import { MediaUploadDialog } from '../../components/media-upload-dialog/media-upload-dialog';
import { MediaUploadDraft } from '../../models/media-upload';
import { Button } from '@openng/optimus-ui/button';
import { Dialog } from '@openng/optimus-ui/dialog';
import { TranslationKey } from '@core/i18n/dictionary';
import { formatDateTime } from '@core/i18n/date-format';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';

@Component({
  selector: 'app-media-page',
  imports: [DataTable, Button, Dialog, MediaUploadDialog, TranslatePipe],
  providers: [MediaStore],
  templateUrl: './media-page.html',
})
export class MediaPage {
  private readonly confirmations = inject(ConfirmDialogService);
  private readonly clipboard = inject(ClipboardService);
  private readonly translator = inject(Translator);
  private readonly localeStore = inject(LocaleStore);

  protected readonly store = inject(MediaStore);

  protected readonly columns = computed<readonly DataTableColumn[]>(() => [
    { field: 'preview', header: '', width: '5rem' },
    { field: 'originalName', header: this.header('media.page.columns.file'), sortable: true },
    { field: 'category', header: this.header('media.page.columns.type'), width: '11rem' },
    {
      field: 'size',
      header: this.header('media.page.columns.size'),
      sortable: true,
      width: '8rem',
    },
    {
      field: 'createdOnUtc',
      header: this.header('media.page.columns.uploaded'),
      sortable: true,
      width: '11rem',
    },
    { field: 'actions', header: '', width: '12rem' },
  ]);

  protected readonly previewed = signal<StoredFile | null>(null);
  protected readonly previewFailed = signal(false);
  protected readonly uploadVisible = signal(false);

  protected categoryLabel(file: StoredFile): string {
    return this.translator.translate(FILE_CATEGORY_LABELS[file.category]);
  }

  protected sizeLabel(file: StoredFile): string {
    return formatFileSize(file.size);
  }

  protected uploadedLabel(file: StoredFile): string {
    return formatDateTime(file.createdAt, this.localeStore.locale());
  }

  protected iconOf(file: StoredFile): string {
    if (file.isVideo()) {
      return 'pi-video';
    }
    if (file.isImage()) {
      return 'pi-image';
    }
    return file.contentType === 'application/pdf' ? 'pi-file-pdf' : 'pi-file';
  }

  protected contentUrl(file: StoredFile): string {
    return this.store.contentUrl(file);
  }

  protected loadPage(request: PageRequest): void {
    void this.store.load(request);
  }

  protected preview(file: StoredFile): void {
    this.previewFailed.set(false);
    this.previewed.set(file);
  }

  protected closePreview(): void {
    this.previewed.set(null);
  }

  protected copyId(file: StoredFile): Promise<void> {
    return this.clipboard.copy(file.id, 'media.page.fileId');
  }

  protected openUpload(): void {
    this.uploadVisible.set(true);
    void this.store.loadExerciseChoices();
  }

  protected async uploadFile(draft: MediaUploadDraft): Promise<void> {
    if (await this.store.upload(draft)) {
      this.uploadVisible.set(false);
    }
  }

  protected async remove(file: StoredFile): Promise<void> {
    if (await this.confirmations.confirmDelete(file.displayName)) {
      await this.store.remove(file);
    }
  }

  private header(key: TranslationKey): string {
    return this.translator.translate(key);
  }
}
