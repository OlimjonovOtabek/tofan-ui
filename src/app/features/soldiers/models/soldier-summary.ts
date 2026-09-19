import { ExperienceLevel, FitnessGoal, Gender } from './soldier-attributes';

export class SoldierSummary {
  constructor(
    readonly userId: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly userName: string,
    readonly gender: Gender,
    readonly countryCode: string,
    readonly goal: FitnessGoal | null,
    readonly experienceLevel: ExperienceLevel | null,
    readonly currentWeightKg: number | null,
    readonly targetWeightKg: number | null,
    readonly isHomeWorkout: boolean | null,
    readonly joinedAt: Date,
  ) {}

  get fullName(): string {
    return fullName(this.firstName, this.lastName, this.userName);
  }
}

export function fullName(firstName: string, lastName: string, fallback: string): string {
  const name = `${firstName} ${lastName}`.trim();
  return name.length > 0 ? name : fallback;
}
