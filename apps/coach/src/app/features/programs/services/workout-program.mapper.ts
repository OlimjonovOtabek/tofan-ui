import { experienceLevels } from '@coach/core/fitness/experience-level.dto';
import { fitnessGoals } from '@coach/core/fitness/fitness-goal.dto';
import { DayDraft } from '../models/day-draft';
import {
  DayVideo,
  WorkoutDay,
  WorkoutProgram,
  WorkoutProgramDetail,
} from '../models/workout-program';
import { WorkoutProgramForm } from '../models/workout-program-form';
import {
  CreateWorkoutProgramRequest,
  DayExerciseResponse,
  UpdateWorkoutProgramRequest,
  WorkoutDayResponse,
  WorkoutProgramDayRequest,
  WorkoutProgramDetailResponse,
  WorkoutProgramResponse,
} from './program.dto';

export type ApiUrlOf = (path: string | null) => string | null;

export function toWorkoutProgram(response: WorkoutProgramResponse): WorkoutProgram {
  return {
    id: response.id,
    name: response.name,
    goal: response.goal === null ? null : fitnessGoals.toDomainOrNull(response.goal),
    experienceLevel:
      response.experienceLevel === null
        ? null
        : experienceLevels.toDomainOrNull(response.experienceLevel),
    isHomeWorkout: response.isHomeWorkout,
    isPublished: response.isPublished,
    dayCount: response.dayCount,
  };
}

export function toWorkoutProgramDetail(
  response: WorkoutProgramDetailResponse,
  urlOf: ApiUrlOf,
): WorkoutProgramDetail {
  const days = [...(response.days ?? [])]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((day) => toWorkoutDay(day, urlOf));
  return {
    ...toWorkoutProgram({ ...response, dayCount: response.dayCount ?? days.length }),
    days,
  };
}

function toWorkoutDay(response: WorkoutDayResponse, urlOf: ApiUrlOf): WorkoutDay {
  const exercises = [...(response.exercises ?? [])].sort((a, b) => a.displayOrder - b.displayOrder);
  const videos = exercises.flatMap((item) => toDayVideo(item, urlOf));
  return {
    id: response.id,
    title: response.title ?? '',
    description: response.description ?? '',
    isRestDay: response.isRestDay,
    videos,
    droppedExerciseCount: exercises.length - videos.length,
  };
}

function toDayVideo(item: DayExerciseResponse, urlOf: ApiUrlOf): DayVideo[] {
  const exercise = item.exercise;
  if (exercise === null || !exercise.videoFileId) {
    return [];
  }
  return [
    {
      key: item.id,
      fileId: exercise.videoFileId,
      name: { en: exercise.name ?? '', uz: exercise.nameUz ?? '', ru: exercise.nameRu ?? '' },
      videoUrl: urlOf(exercise.videoUrl),
      hlsUrl: urlOf(exercise.hlsUrl),
      posterUrl: urlOf(exercise.posterUrl),
    },
  ];
}

export function toDayRequest(draft: DayDraft): WorkoutProgramDayRequest {
  const description = draft.description.trim();
  return {
    title: draft.title.trim(),
    ...(description === '' ? {} : { description }),
    videos: draft.videos.flatMap((video) => {
      if (video.fileId === null) {
        return [];
      }
      const name = video.name.trim();
      return [name === '' ? { fileId: video.fileId } : { fileId: video.fileId, name }];
    }),
  };
}

export function toUpdateWorkoutProgramRequest(
  form: WorkoutProgramForm,
): UpdateWorkoutProgramRequest {
  if (form.goal === null) {
    throw new Error('A workout program needs a goal before it is sent.');
  }
  return {
    name: form.name.trim(),
    goal: fitnessGoals.toApi(form.goal),
    experienceLevel: experienceLevels.toApi(form.experienceLevel),
    isHomeWorkout: form.isHomeWorkout,
  };
}

export function toCreateWorkoutProgramRequest(
  form: WorkoutProgramForm,
  days: readonly DayDraft[],
): CreateWorkoutProgramRequest {
  return { ...toUpdateWorkoutProgramRequest(form), days: days.map(toDayRequest) };
}
