import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { toDomainError } from '@core/http/api-error.mapper';
import { UploadCancelledError } from '@shared/components/file-upload/file-upload-request';
import { fileCategories } from '@shared/models/file-category.dto';
import { Observable, firstValueFrom, fromEvent, takeUntil } from 'rxjs';
import { VIDEO_FILE_CATEGORY } from './video-upload';

const UPLOADS = '/files/uploads';
const CHUNK_BYTES = 8 * 1024 * 1024;
const MAX_RETRIES = 5;
const RETRY_STEP_MS = 2000;
const TUS_VERSION = '1.0.0';
const CHUNK_CONTENT_TYPE = 'application/offset+octet-stream';
const OFFSET_HEADER = 'Upload-Offset';
const LOCATION_HEADER = 'Location';
const GONE_STATUSES: readonly number[] = [404, 410];
const RETRYABLE_STATUSES: readonly number[] = [0, 401, 409, 423, 429, 500, 502, 503, 504];

export interface TusUpload {
  readonly file: File;
  readonly onProgress: (progress: number) => void;
  readonly signal: AbortSignal;
}

@Injectable({ providedIn: 'root' })
export class TusUploadService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiClient);
  private readonly openUploads = new WeakMap<File, string>();

  async upload(upload: TusUpload): Promise<string> {
    try {
      const uploadId = await this.sendChunks(upload);
      const fileId = await this.api.post<string>(`${UPLOADS}/${uploadId}/complete`, {
        category: fileCategories.toApi(VIDEO_FILE_CATEGORY),
        fileName: upload.file.name,
      });
      this.openUploads.delete(upload.file);
      return fileId;
    } catch (error) {
      throw upload.signal.aborted ? new UploadCancelledError() : toDomainError(error);
    }
  }

  private async sendChunks(upload: TusUpload): Promise<string> {
    const { file, onProgress, signal } = upload;
    const { uploadId, offset: start } = await this.openOrResume(upload);
    let offset = start;
    let failures = 0;
    onProgress(offset / file.size);
    while (offset < file.size) {
      try {
        offset = await this.sendChunk(uploadId, file, offset, signal);
        failures = 0;
        onProgress(offset / file.size);
      } catch (error) {
        failures += 1;
        if (!isRetryable(error) || failures > MAX_RETRIES) {
          this.forgetWhenGone(file, error);
          throw error;
        }
        await waitBeforeRetry(failures, signal);
        const resumed = await this.offsetOf(uploadId, signal);
        if (resumed === null) {
          throw error;
        }
        offset = resumed;
      }
    }
    return uploadId;
  }

  private async openOrResume(upload: TusUpload): Promise<{ uploadId: string; offset: number }> {
    const known = this.openUploads.get(upload.file);
    const offset = known === undefined ? null : await this.offsetOf(known, upload.signal);
    if (known !== undefined && offset !== null) {
      return { uploadId: known, offset };
    }
    const uploadId = await this.open(upload);
    this.openUploads.set(upload.file, uploadId);
    return { uploadId, offset: 0 };
  }

  private async open({ file, signal }: TusUpload): Promise<string> {
    const headers = tusHeaders()
      .set('Upload-Length', String(file.size))
      .set('Upload-Metadata', `filename ${encodeName(file.name)}`);
    const response = await untilAborted(
      this.http.post(this.api.url(UPLOADS), null, {
        headers,
        observe: 'response',
        responseType: 'text',
      }),
      signal,
    );
    return uploadIdOf(response);
  }

  private async sendChunk(
    uploadId: string,
    file: File,
    offset: number,
    signal: AbortSignal,
  ): Promise<number> {
    const chunk = file.slice(offset, offset + CHUNK_BYTES);
    const headers = tusHeaders()
      .set(OFFSET_HEADER, String(offset))
      .set('Content-Type', CHUNK_CONTENT_TYPE);
    const response = await untilAborted(
      this.http.patch(this.uploadUrl(uploadId), chunk, {
        headers,
        observe: 'response',
        responseType: 'text',
      }),
      signal,
    );
    return offsetOfResponse(response) ?? offset + chunk.size;
  }

  private async offsetOf(uploadId: string, signal: AbortSignal): Promise<number | null> {
    try {
      const response = await untilAborted(
        this.http.head(this.uploadUrl(uploadId), {
          headers: tusHeaders(),
          observe: 'response',
          responseType: 'text',
        }),
        signal,
      );
      return offsetOfResponse(response);
    } catch (error) {
      if (isGone(error)) {
        return null;
      }
      throw error;
    }
  }

  private uploadUrl(uploadId: string): string {
    return this.api.url(`${UPLOADS}/${encodeURIComponent(uploadId)}`);
  }

  private forgetWhenGone(file: File, error: unknown): void {
    if (isGone(error)) {
      this.openUploads.delete(file);
    }
  }
}

function tusHeaders(): HttpHeaders {
  return new HttpHeaders({ 'Tus-Resumable': TUS_VERSION });
}

function encodeName(name: string): string {
  const bytes = new TextEncoder().encode(name);
  return btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(''));
}

function uploadIdOf(response: HttpResponse<unknown>): string {
  const location = response.headers.get(LOCATION_HEADER) ?? '';
  const uploadId = location.split('?')[0].split('/').filter(Boolean).pop();
  if (uploadId === undefined) {
    throw new Error('The server opened an upload without a location.');
  }
  return uploadId;
}

function offsetOfResponse(response: HttpResponse<unknown>): number | null {
  const offset = Number.parseInt(response.headers.get(OFFSET_HEADER) ?? '', 10);
  return Number.isNaN(offset) ? null : offset;
}

function isGone(error: unknown): boolean {
  return error instanceof HttpErrorResponse && GONE_STATUSES.includes(error.status);
}

function isRetryable(error: unknown): boolean {
  return error instanceof HttpErrorResponse && RETRYABLE_STATUSES.includes(error.status);
}

function untilAborted<T>(request: Observable<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) {
    throw new UploadCancelledError();
  }
  return firstValueFrom(request.pipe(takeUntil(fromEvent(signal, 'abort'))));
}

function waitBeforeRetry(failures: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, RETRY_STEP_MS * failures);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new UploadCancelledError());
      },
      { once: true },
    );
  });
}
