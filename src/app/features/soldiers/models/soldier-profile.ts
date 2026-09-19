import {
  ActivityLevel,
  ExperienceLevel,
  FitnessGoal,
  Gender,
  GoalPace,
  TrainerStyle,
  WeekDay,
} from './soldier-attributes';

export interface SoldierProfile {
  readonly profileId: string;
  readonly userId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly userName: string;
  readonly fullName: string;
  readonly dateOfBirth: Date;
  readonly gender: Gender;
  readonly photoUrl: string | null;
  readonly countryCode: string;
  readonly timeZone: string;
  readonly heightCm: number | null;
  readonly startingWeightKg: number | null;
  readonly currentWeightKg: number | null;
  readonly targetWeightKg: number | null;
  readonly bodyFatPercent: number | null;
  readonly experienceLevel: ExperienceLevel | null;
  readonly activityLevel: ActivityLevel | null;
  readonly isHomeWorkout: boolean | null;
  readonly goal: FitnessGoal | null;
  readonly goalPace: GoalPace | null;
  readonly workoutDaysPerWeek: number | null;
  readonly trainingDays: readonly WeekDay[];
  readonly goalStartDate: Date | null;
  readonly goalTargetDate: Date | null;
  readonly autoAdjustPlanEnabled: boolean | null;
  readonly currencyCode: string | null;
  readonly trainerStyle: TrainerStyle | null;
  readonly languageCode: string | null;
  readonly bmi: number | null;
  readonly estimatedWeeksToGoal: number | null;
  readonly createdAt: Date;
  readonly updatedAt: Date | null;
}

export function ageOn(dateOfBirth: Date, now: Date): number {
  const years = now.getUTCFullYear() - dateOfBirth.getUTCFullYear();
  const birthdayPassed =
    now.getUTCMonth() > dateOfBirth.getUTCMonth() ||
    (now.getUTCMonth() === dateOfBirth.getUTCMonth() &&
      now.getUTCDate() >= dateOfBirth.getUTCDate());
  return birthdayPassed ? years : years - 1;
}

export function weightLeftKg(profile: SoldierProfile): number | null {
  if (profile.currentWeightKg === null || profile.targetWeightKg === null) {
    return null;
  }
  return roundToTenth(profile.targetWeightKg - profile.currentWeightKg);
}

export function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}
