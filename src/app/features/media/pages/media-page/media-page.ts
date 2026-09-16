import { Component, inject, signal } from '@angular/core';
import { PageRequest } from '@shared/models/page';
import { StoredFile } from '../../models/stored-file';
import { FileUsage } from '../../models/file-usage';
import { DataTable, DataTableColumn } from '@shared/components/data-table/data-table';
import { ConfirmDialogService } from '@core/feedback/confirmation.service';
import { ClipboardService } from '@core/feedback/clipboard.service';
import { formatFileSize } from '@shared/utils/file-size';
import { FILE_CATEGORY_LABELS } from '../../models/file-labels';
import { MediaStore } from '../../media.store';
import { Button } from '@openng/optimus-ui/button';
import { Dialog } from '@openng/optimus-ui/dialog';

@Component({
  selector: 'app-media-page',
  imports: [DataTable, Button, Dialog],
  providers: [MediaStore],
  templateUrl: './media-page.html',
})
export class MediaPage {
  private readonly confirmations = inject(ConfirmDialogService);
  private readonly clipboard = inject(ClipboardService);

  protected readonly store = inject(MediaStore);

  protected readonly columns: readonly DataTableColumn[] = [
    { field: 'preview', header: '', width: '5rem' },
    { field: 'originalName', header: 'Fayl', sortable: true },
    { field: 'category', header: 'Turi', width: '11rem' },
    { field: 'size', header: 'Hajmi', sortable: true, width: '8rem' },
    { field: 'createdOnUtc', header: 'Yuklangan', sortable: true, width: '11rem' },
    { field: 'actions', header: '', width: '12rem' },
  ];

  protected readonly previewed = signal<StoredFile | null>(null);
  protected readonly previewFailed = signal(false);

  protected categoryLabel(file: StoredFile): string {
    return FILE_CATEGORY_LABELS[file.category];
  }

  protected sizeLabel(file: StoredFile): string {
    return formatFileSize(file.size);
  }

  protected uploadedLabel(file: StoredFile): string {
    return file.createdAt.toLocaleString('uz-UZ', { dateStyle: 'short', timeStyle: 'short' });
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
    return this.clipboard.copy(file.id, 'Fayl ID');
  }

  protected async remove(file: StoredFile): Promise<void> {
    const usages = await this.store.findUsages(file);
    if (usages === null) {
      return;
    }
    if (await this.confirmations.confirmDelete(file.displayName, usageWarning(usages))) {
      await this.store.remove(file);
    }
  }
}

function usageWarning(usages: readonly FileUsage[]): string | undefined {
  if (usages.length === 0) {
    return undefined;
  }
  const names = usages.map((usage) => `"${usage.ownerName}"`).join(', ');
  return (
    `Bu fayl ${usages.length} ta mashqda video sifatida ishlatilmoqda: ${names}. ` +
    "O'chirilsa, ilovada bu mashqlarning videosi ochilmay qoladi."
  );
}
