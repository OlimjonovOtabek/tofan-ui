import { toDayPeriod } from '@shared/utils/day-range';
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
  const period = toDayPeriod([firstDay, lastDay]);
  return {
    ...(period.from === undefined ? {} : { joinedFrom: period.from }),
    ...(period.before === undefined ? {} : { joinedBefore: period.before }),
  };
}
