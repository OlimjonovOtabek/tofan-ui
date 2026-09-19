import { ExperienceLevel, FitnessGoal, Gender } from './soldier-attributes';

export interface SoldierFilter {
  readonly search?: string;
  readonly gender?: Gender;
  readonly goal?: FitnessGoal;
  readonly experienceLevel?: ExperienceLevel;
  readonly isHomeWorkout?: boolean;
  readonly joinedFrom?: Date;
  readonly joinedBefore?: Date;
}

export interface JoinedPeriod {
  readonly joinedFrom?: Date;
  readonly joinedBefore?: Date;
}

export function toJoinedPeriod(firstDay: Date | null, lastDay: Date | null): JoinedPeriod {
  return {
    ...(firstDay === null ? {} : { joinedFrom: startOfDay(firstDay) }),
    ...(lastDay === null ? {} : { joinedBefore: startOfNextDay(lastDay) }),
  };
}

function startOfDay(day: Date): Date {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate());
}

function startOfNextDay(day: Date): Date {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
}
