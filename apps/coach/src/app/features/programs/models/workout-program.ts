import { ExperienceLevel } from '@coach/core/fitness/experience-level';
import { FitnessGoal } from '@coach/core/fitness/fitness-goal';
import { LocalizedText } from '@shared/models/localized-text';

export const MAX_PROGRAM_DAYS = 7;

export interface WorkoutProgram {
  readonly id: string;
  readonly name: string;
  readonly goal: FitnessGoal | null;
  readonly experienceLevel: ExperienceLevel | null;
  readonly isHomeWorkout: boolean;
  readonly isPublished: boolean;
  readonly dayCount: number;
}

export interface DayVideo {
  readonly key: string;
  readonly fileId: string;
  readonly name: LocalizedText;
  readonly videoUrl: string | null;
  readonly hlsUrl: string | null;
  readonly posterUrl: string | null;
}

export interface WorkoutDay {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly isRestDay: boolean;
  readonly videos: readonly DayVideo[];
  readonly droppedExerciseCount: number;
}

export interface WorkoutProgramDetail extends WorkoutProgram {
  readonly days: readonly WorkoutDay[];
}

export type DayReadiness = 'rest' | 'ready' | 'empty';

export function dayReadiness(day: WorkoutDay): DayReadiness {
  if (day.isRestDay) {
    return 'rest';
  }
  return day.videos.length > 0 ? 'ready' : 'empty';
}

export function publishedFirst<T extends { readonly isPublished: boolean }>(
  programs: readonly T[],
): T[] {
  return [
    ...programs.filter((program) => program.isPublished),
    ...programs.filter((program) => !program.isPublished),
  ];
}

export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return [...items];
  }
  const moved = [...items];
  const [item] = moved.splice(from, 1);
  moved.splice(to, 0, item);
  return moved;
}
