import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Page, PageRequest } from '@domain/shared/paging/page';
import { StoredFile } from '@domain/storage/entities/stored-file';
import { FileRepository, FileUploadRequest } from '@domain/storage/repositories/file.repository';
import { ApiClient } from '@infrastructure/api/api-client';
import { toDomainError } from '@infrastructure/api/api-error.mapper';
import { unwrapResult } from '@infrastructure/api/result-envelope';
import { toPage, toPagedQuery } from '@infrastructure/api/paging.mapper';
import {
  ApiConfiguration,
  deleteFilesById,
  getFiles,
  getFilesById,
} from '@infrastructure/api/generated';
import { filter, lastValueFrom, tap } from 'rxjs';
import { fileCategories, toStoredFile } from './file.mapper';

const PERCENT = 100;

/**
 * Uploads go through `HttpClient` directly rather than the generated function: only a raw request
 * can report progress, which matters for exercise videos of up to 200 MB.
 */
@Injectable()
export class HttpFileRepository implements FileRepository {
  private readonly http = inject(HttpClient);
  private readonly apiClient = inject(ApiClient);
  private readonly rootUrl = inject(ApiConfiguration).rootUrl;

  async upload({ file, category, caption, onProgress }: FileUploadRequest): Promise<string> {
    const form = new FormData();
    form.append('file', file, file.name);
    form.append('category', String(fileCategories.toApi(category)));
    if (caption !== undefined) {
      form.append('caption', caption);
    }

    const request = new HttpRequest('POST', `${this.rootUrl}/files`, form, {
      reportProgress: true,
    });

    try {
      const response = await lastValueFrom(
        this.http.request<unknown>(request).pipe(
          tap((event) => reportProgress(event, onProgress)),
          filter((event): event is HttpResponse<unknown> => event instanceof HttpResponse),
        ),
      );
      return unwrapResult(response.body as { isSuccess: boolean; data: string });
    } catch (error) {
      throw toDomainError(error);
    }
  }

  async list(page: PageRequest): Promise<Page<StoredFile>> {
    return toPage(await this.apiClient.invoke(getFiles, toPagedQuery(page)), toStoredFile);
  }

  async getById(id: string): Promise<StoredFile> {
    return toStoredFile(await this.apiClient.invoke(getFilesById, { id }));
  }

  async delete(id: string): Promise<void> {
    await this.apiClient.invoke(deleteFilesById, { id });
  }

  contentUrl(id: string): string {
    return `${this.rootUrl}/files/${id}/content`;
  }
}

function reportProgress(event: HttpEvent<unknown>, onProgress?: (percent: number) => void): void {
  if (event.type === HttpEventType.UploadProgress && event.total !== undefined && event.total > 0) {
    onProgress?.(Math.round((event.loaded / event.total) * PERCENT));
  }
}
