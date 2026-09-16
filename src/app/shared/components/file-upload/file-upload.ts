import { Component, inject, input, model, signal } from '@angular/core';
import { FileCategory } from '@shared/models/file-category';
import { allowedExtensions, maxUploadSize } from '@shared/utils/file-upload-rules';
import { FileUploadService } from './file-upload.service';
import { NotificationService } from '@core/feedback/notification.service';
import { Button } from '@openng/optimus-ui/button';
import { ProgressBar } from '@openng/optimus-ui/progressbar';

const BYTES_IN_MEGABYTE = 1024 * 1024;

@Component({
  selector: 'app-file-upload',
  imports: [Button, ProgressBar],
  templateUrl: './file-upload.html',
})
export class FileUpload {
  private readonly fileUploadService = inject(FileUploadService);
  private readonly notifications = inject(NotificationService);

  readonly category = input.required<FileCategory>();
  readonly label = input('Fayl');
  readonly fileId = model<string | null>(null);
  readonly fileName = model<string | null>(null);

  protected readonly uploading = signal(false);
  protected readonly progress = signal(0);

  protected accept(): string {
    return allowedExtensions(this.category()).join(',');
  }

  protected maxSizeLabel(): string {
    return `${Math.round(maxUploadSize(this.category()) / BYTES_IN_MEGABYTE)} MB gacha`;
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
      this.notifications.success('Fayl yuklandi.');
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
