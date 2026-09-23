import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { DownloadedFile } from '@shared/models/downloaded-file';

const CONTENT_DISPOSITION = 'Content-Disposition';
const ENCODED_FILE_NAME = /filename\*\s*=\s*(?:UTF-8)?''([^;]+)/i;
const PLAIN_FILE_NAME = /filename\s*=\s*"?([^";]+)"?/i;

export function toDownloadedFile(
  response: HttpResponse<Blob>,
  fallbackFileName: string,
): DownloadedFile {
  return {
    content: response.body ?? new Blob(),
    fileName: fileNameOf(response.headers.get(CONTENT_DISPOSITION)) ?? fallbackFileName,
  };
}

export function fileNameOf(contentDisposition: string | null): string | null {
  if (contentDisposition === null) {
    return null;
  }
  const encoded = ENCODED_FILE_NAME.exec(contentDisposition)?.[1];
  if (encoded !== undefined) {
    return decodeURIComponent(encoded.trim());
  }
  return PLAIN_FILE_NAME.exec(contentDisposition)?.[1]?.trim() ?? null;
}

export async function withReadableBody(error: unknown): Promise<unknown> {
  if (!(error instanceof HttpErrorResponse) || !(error.error instanceof Blob)) {
    return error;
  }
  return new HttpErrorResponse({
    error: parseJsonOrNull(await error.error.text()),
    headers: error.headers,
    status: error.status,
    statusText: error.statusText,
    url: error.url ?? undefined,
  });
}

function parseJsonOrNull(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}
