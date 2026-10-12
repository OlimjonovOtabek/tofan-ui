import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { toDomainError } from '@core/http/api-error.mapper';
import { unwrapResult } from '@core/http/result-envelope';
import { fileCategories } from '@shared/models/file-category.dto';
import { ensureUploadIsAllowed } from '@shared/utils/file-upload-rules';
import { filter, Subscription, tap } from 'rxjs';
import { FileUploadRequest, FileUploadTask, UploadCancelledError } from './file-upload-request';

const FILES = '/files';
const PERCENT = 100;

@Injectable({ providedIn: 'root' })
export class FileUploadService {
  private readonly http = inject(HttpClient);
  private readonly apiClient = inject(ApiClient);

  async upload({ file, category, caption, onProgress }: FileUploadRequest): Promise<string> {
    return this.startUpload({ file, category, caption, onProgress }).result;
  }

  startUpload({ file, category, caption, onProgress }: FileUploadRequest): FileUploadTask {
    ensureUploadIsAllowed(file.name, file.size, category);
    const request = new HttpRequest(
      'POST',
      this.apiClient.url(FILES),
      toFormData(file, category, caption),
      {
        reportProgress: true,
      },
    );

    let subscription: Subscription | null = null;
    let rejectResult: (reason: unknown) => void = () => undefined;
    let complete = false;
    const result = new Promise<string>((resolve, reject) => {
      rejectResult = reject;
      subscription = this.http.request<unknown>(request).pipe(
        tap((event) => reportProgress(event, onProgress)),
        filter((event): event is HttpResponse<unknown> => event instanceof HttpResponse),
      ).subscribe({
        next: (response) => {
          complete = true;
          try {
            resolve(unwrapResult(response.body) as string);
          } catch (error) {
            reject(error);
          }
        },
        error: (error: unknown) => {
          complete = true;
          reject(toDomainError(error));
        },
      });
    });
    return {
      result,
      cancel: () => {
        if (complete) {
          return;
        }
        complete = true;
        subscription?.unsubscribe();
        rejectResult(new UploadCancelledError());
      },
    };
  }
}

function toFormData(
  file: File,
  category: FileUploadRequest['category'],
  caption?: string,
): FormData {
  const form = new FormData();
  form.append('file', file, file.name);
  form.append('category', String(fileCategories.toApi(category)));
  if (caption !== undefined) {
    form.append('caption', caption);
  }
  return form;
}

function reportProgress(event: HttpEvent<unknown>, onProgress?: (percent: number) => void): void {
  if (event.type === HttpEventType.UploadProgress && event.total !== undefined && event.total > 0) {
    onProgress?.(Math.round((event.loaded / event.total) * PERCENT));
  }
}
