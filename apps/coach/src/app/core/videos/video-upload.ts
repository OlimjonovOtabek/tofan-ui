import { allowedExtensions, extensionOf } from '@shared/utils/file-upload-rules';

export const VIDEO_UPLOAD_MAX_BYTES = 1024 * 1024 * 1024;
export const VIDEO_FILE_CATEGORY = 'exerciseVideo';
const VIDEO_TOO_LARGE_CODE = 'StoredFile.TooLarge';

export type VideoUploadStatus =
  | { readonly kind: 'compressing'; readonly progress: number }
  | { readonly kind: 'sending'; readonly progress: number }
  | { readonly kind: 'done'; readonly fileId: string }
  | { readonly kind: 'failed'; readonly error: unknown }
  | { readonly kind: 'tooLarge' };

export interface VideoUpload {
  readonly id: string;
  readonly group: string;
  readonly link: string;
  readonly status: VideoUploadStatus;
}

export interface VideoUploadTarget {
  readonly group: string;
  readonly link: string;
}

export interface QueuedVideoSave extends VideoUploadTarget {
  readonly ids: readonly string[];
  readonly tag?: string;
  readonly save: (fileIds: Readonly<Record<string, string>>) => Promise<unknown>;
}

export interface VideoUploadSaveResult {
  readonly group: string;
  readonly tag: string | null;
  readonly failure: unknown;
  readonly succeeded: boolean;
}

export type VideoUploadPhase = 'preparing' | 'sending' | 'saving';

export interface VideoUploadSummary {
  readonly phase: VideoUploadPhase;
  readonly progress: number | null;
  readonly count: number;
  readonly link: string;
}

export function isActiveUpload(status: VideoUploadStatus): boolean {
  return status.kind === 'compressing' || status.kind === 'sending';
}

export function isLostUpload(upload: VideoUpload | undefined): boolean {
  return (
    upload === undefined || upload.status.kind === 'failed' || upload.status.kind === 'tooLarge'
  );
}

export function isVideoFileAccepted(file: File): boolean {
  return file.size > 0 && allowedExtensions(VIDEO_FILE_CATEGORY).includes(extensionOf(file.name));
}

export function isVideoTooLargeError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === VIDEO_TOO_LARGE_CODE
  );
}

export function fileIdsOf(uploads: readonly (VideoUpload | undefined)[]): Record<string, string> {
  const fileIds: Record<string, string> = {};
  for (const upload of uploads) {
    if (upload?.status.kind === 'done') {
      fileIds[upload.id] = upload.status.fileId;
    }
  }
  return fileIds;
}

export function isSameProgress(
  current: VideoUploadStatus | undefined,
  next: VideoUploadStatus & { progress: number },
): boolean {
  return (
    (current?.kind === 'compressing' || current?.kind === 'sending') &&
    current.kind === next.kind &&
    wholePercent(current.progress) === wholePercent(next.progress)
  );
}

export function wholePercent(progress: number): number {
  return Math.floor(progress * 100);
}

export function meanProgress(uploads: readonly VideoUpload[]): number {
  return uploads.reduce((sum, upload) => sum + progressOf(upload.status), 0) / uploads.length;
}

export function summarizeUploads(
  uploads: readonly VideoUpload[],
  savingLinks: readonly string[],
): VideoUploadSummary | null {
  const active = uploads.filter((upload) => isActiveUpload(upload.status));
  if (active.length === 0) {
    return savingLinks.length === 0
      ? null
      : { phase: 'saving', progress: null, count: 0, link: savingLinks[savingLinks.length - 1] };
  }
  const preparing = active.filter((upload) => upload.status.kind === 'compressing');
  const shown = preparing.length > 0 ? preparing : active;
  return {
    phase: preparing.length > 0 ? 'preparing' : 'sending',
    progress: meanProgress(shown),
    count: active.length,
    link: savingLinks[savingLinks.length - 1] ?? active[active.length - 1].link,
  };
}

function progressOf(status: VideoUploadStatus): number {
  return status.kind === 'compressing' || status.kind === 'sending' ? status.progress : 0;
}
