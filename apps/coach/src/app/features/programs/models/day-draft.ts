import { AppLocale } from '@core/i18n/locale';
import { pickLocalized } from '@shared/models/localized-text';
import { VideoUpload, isLostUpload } from '@coach/core/videos/video-upload';
import { DayVideo, WorkoutDay } from './workout-program';

export const DAY_DESCRIPTION_MAX = 1000;
export const VIDEO_NAME_MAX = 200;
export const DAY_UPLOAD_GROUP = 'workout-day';
export const NEW_PROGRAM_UPLOAD_GROUP = 'new-program';
export const DAY_UPLOAD_LINK = '/programs';

export interface DayVideoDraft {
  readonly key: string;
  readonly name: string;
  readonly fileId: string | null;
  readonly videoUrl: string | null;
  readonly hlsUrl: string | null;
  readonly posterUrl: string | null;
  readonly localUrl: string | null;
  readonly progress: number | null;
  readonly preparing: boolean;
  readonly uploadFailed: boolean;
}

export interface DayDraft {
  readonly title: string;
  readonly description: string;
  readonly videos: readonly DayVideoDraft[];
  readonly droppedExerciseCount: number;
}

export const EMPTY_DAY_DRAFT: DayDraft = {
  title: '',
  description: '',
  videos: [],
  droppedExerciseCount: 0,
};

export function isUploading(video: DayVideoDraft): boolean {
  return video.fileId === null && !video.uploadFailed;
}

export function canSaveDay(draft: DayDraft): boolean {
  return (
    draft.title.trim().length > 0 &&
    draft.videos.length > 0 &&
    draft.videos.every((video) => !video.uploadFailed)
  );
}

export function uploadedCount(draft: DayDraft): number {
  return draft.videos.filter((video) => video.fileId !== null).length;
}

export function withUpload(video: DayVideoDraft, upload: VideoUpload | undefined): DayVideoDraft {
  if (video.fileId !== null) {
    return video;
  }
  const settled = { ...video, progress: null, preparing: false };
  switch (upload?.status.kind) {
    case 'compressing':
      return { ...settled, progress: upload.status.progress, preparing: true, uploadFailed: false };
    case 'sending':
      return { ...settled, progress: upload.status.progress, uploadFailed: false };
    case 'done':
      return { ...settled, fileId: upload.status.fileId, uploadFailed: false };
    default:
      return { ...settled, uploadFailed: true };
  }
}

export function pendingUploadsOf(days: readonly DayDraft[]): string[] {
  return days.flatMap((day) =>
    day.videos.filter((video) => video.fileId === null).map((video) => video.key),
  );
}

export function hasLostUploads(
  days: readonly DayDraft[],
  uploads: Readonly<Record<string, VideoUpload>>,
): boolean {
  return pendingUploadsOf(days).some((key) => isLostUpload(uploads[key]));
}

export function dayFingerprint(draft: DayDraft): string {
  return JSON.stringify([
    draft.title.trim(),
    draft.description.trim(),
    draft.videos.map((video) => [video.key, video.name.trim()]),
  ]);
}

export function dayDraftOf(day: WorkoutDay, locale: AppLocale): DayDraft {
  return {
    title: day.title,
    description: day.description,
    videos: day.videos.map((video) => savedVideoDraft(video, locale)),
    droppedExerciseCount: day.droppedExerciseCount,
  };
}

export function pendingVideoDraft(key: string, localUrl: string): DayVideoDraft {
  return {
    key,
    name: '',
    fileId: null,
    videoUrl: null,
    hlsUrl: null,
    posterUrl: null,
    localUrl,
    progress: 0,
    preparing: true,
    uploadFailed: false,
  };
}

function savedVideoDraft(video: DayVideo, locale: AppLocale): DayVideoDraft {
  return {
    key: video.key,
    name: pickLocalized(video.name, locale),
    fileId: video.fileId,
    videoUrl: video.videoUrl,
    hlsUrl: video.hlsUrl,
    posterUrl: video.posterUrl,
    localUrl: null,
    progress: null,
    preparing: false,
    uploadFailed: false,
  };
}
