import { AppLocale } from '@core/i18n/locale';
import { pickLocalized } from '@shared/models/localized-text';
import { DayVideo, WorkoutDay } from './workout-program';

export const DAY_DESCRIPTION_MAX = 1000;
export const VIDEO_NAME_MAX = 200;

export interface DayVideoDraft {
  readonly key: string;
  readonly name: string;
  readonly fileId: string | null;
  readonly videoUrl: string | null;
  readonly hlsUrl: string | null;
  readonly posterUrl: string | null;
  readonly localUrl: string | null;
  readonly progress: number | null;
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
    draft.videos.every((video) => video.fileId !== null)
  );
}

export function uploadedCount(draft: DayDraft): number {
  return draft.videos.filter((video) => !isUploading(video) && !video.uploadFailed).length;
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
    uploadFailed: false,
  };
}
