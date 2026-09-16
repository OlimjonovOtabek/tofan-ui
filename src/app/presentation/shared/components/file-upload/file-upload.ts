import { Component, inject, input, model, signal } from '@angular/core';
import { UploadFileUseCase } from '@application/storage/upload-file.use-case';
import { FileCategory } from '@domain/storage/file-category';
import { allowedExtensions, maxUploadSize } from '@domain/storage/file-upload-rules';
import { NotificationService } from '@presentation/shared/feedback/notification.service';
import { Button } from '@openng/optimus-ui/button';
import { ProgressBar } from '@openng/optimus-ui/progressbar';

const BYTES_IN_MEGABYTE = 1024 * 1024;

/**
 * Picks one file, uploads it with a progress bar and hands the caller the stored file id
 * (`videoFileId` and friends). Removing only detaches the file; deleting it is a separate action.
 */
@Component({
  selector: 'app-file-upload',
  imports: [Button, ProgressBar],
  templateUrl: './file-upload.html',
})
export class FileUpload {
  private readonly uploadFileUseCase = inject(UploadFileUseCase);
  private readonly notifications = inject(NotificationService);

  readonly category = input.required<FileCategory>();
  readonly label = input('Fayl');
  /** Id of the stored file, empty when nothing is attached. */
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
      const id = await this.uploadFileUseCase.execute(file, this.category(), (percent) =>
        this.progress.set(percent),
      );
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
