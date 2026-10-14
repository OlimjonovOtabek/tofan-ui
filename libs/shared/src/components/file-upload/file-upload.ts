import { Component, inject, input, model, signal } from '@angular/core';
import { FileCategory } from '@shared/models/file-category';
import { allowedExtensions, maxUploadSize } from '@shared/utils/file-upload-rules';
import { FileUploadService } from './file-upload.service';
import { NotificationService } from '@core/feedback/notification.service';
import { Button } from '@openng/optimus-ui/button';
import { ProgressBar } from '@openng/optimus-ui/progressbar';
import { TranslatePipe } from '@core/i18n/translate.pipe';

const BYTES_IN_MEGABYTE = 1024 * 1024;
let nextInputId = 0;

@Component({
  selector: 'app-file-upload',
  imports: [Button, ProgressBar, TranslatePipe],
  templateUrl: './file-upload.html',
})
export class FileUpload {
  private readonly fileUploadService = inject(FileUploadService);
  private readonly notifications = inject(NotificationService);

  readonly category = input.required<FileCategory>();
  readonly label = input<string | null>(null);
  readonly fileId = model<string | null>(null);
  readonly fileName = model<string | null>(null);

  protected readonly inputId = `file-upload-${nextInputId++}`;
  protected readonly uploading = signal(false);
  protected readonly progress = signal(0);

  protected accept(): string {
    return allowedExtensions(this.category()).join(',');
  }

  protected maxSize(): string {
    return `${Math.round(maxUploadSize(this.category()) / BYTES_IN_MEGABYTE)} MB`;
  }

  protected async choose(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file === undefined) {
      return;
    }

    this.uploading.set(true);
    this.progress.set(0);
    try {
      const id = await this.fileUploadService.upload({
        file,
        category: this.category(),
        onProgress: (percent) => this.progress.set(percent),
      });
      this.fileId.set(id);
      this.fileName.set(file.name);
      this.notifications.success('common.file.uploaded');
    } catch (error) {
      this.notifications.error(error);
    } finally {
      this.uploading.set(false);
    }
  }

  protected detach(): void {
    this.fileId.set(null);
    this.fileName.set(null);
  }
}
