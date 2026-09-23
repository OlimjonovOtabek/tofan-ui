import { DOCUMENT, Injectable, inject } from '@angular/core';
import { DownloadedFile } from '@shared/models/downloaded-file';

@Injectable({ providedIn: 'root' })
export class FileDownloadService {
  private readonly document = inject(DOCUMENT);

  save(file: DownloadedFile): void {
    const url = URL.createObjectURL(file.content);
    const link = this.document.createElement('a');
    link.href = url;
    link.download = file.fileName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url));
  }
}
