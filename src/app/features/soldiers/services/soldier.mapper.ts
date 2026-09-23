import { enumMap } from '@shared/utils/enum-map';
import {
  ActivityLevel,
  ExperienceLevel,
  FitnessGoal,
  Gender,
  GoalPace,
  TrainerStyle,
  WEEK_DAYS,
  WeekDay,
  WeightSource,
} from '../models/soldier-attributes';
import { SoldierProfile } from '../models/soldier-profile';
import { SoldierSummary, fullName } from '../models/soldier-summary';
import { WeightEntry } from '../models/weight-entry';
import {
  ActivityLevel as ApiActivityLevel,
  ExperienceLevel as ApiExperienceLevel,
  FitnessGoal as ApiFitnessGoal,
  Gender as ApiGender,
  GoalPace as ApiGoalPace,
  SoldierListItemResponse,
  SoldierResponse,
  TrainerStyle as ApiTrainerStyle,
  WeightLogResponse,
  WeightSource as ApiWeightSource,
} from './soldier.dto';

export const genders = enumMap<Gender, ApiGender>(ApiGender);
export const fitnessGoals = enumMap<FitnessGoal, ApiFitnessGoal>(ApiFitnessGoal);
export const experienceLevels = enumMap<ExperienceLevel, ApiExperienceLevel>(ApiExperienceLevel);
const activityLevels = enumMap<ActivityLevel, ApiActivityLevel>(ApiActivityLevel);
const goalPaces = enumMap<GoalPace, ApiGoalPace>(ApiGoalPace);
const trainerStyles = enumMap<TrainerStyle, ApiTrainerStyle>(ApiTrainerStyle);
const weightSources = enumMap<WeightSource, ApiWeightSource>(ApiWeightSource);

export function toSoldierSummary(response: SoldierListItemResponse): SoldierSummary {
  return new SoldierSummary(
    response.userId,
    response.firstName,
    response.lastName,
    response.userName,
    genders.toDomainOrNull(response.gender),
    response.countryCode,
    optional(response.goal, fitnessGoals.toDomainOrNull),
    optional(response.experienceLevel, experienceLevels.toDomainOrNull),
    response.currentWeightKg ?? null,
    response.targetWeightKg ?? null,
    response.isHomeWorkout ?? null,
    new Date(response.createdOnUtc),
  );
}

export function toSoldierProfile(response: SoldierResponse): SoldierProfile {
  return {
    ...identityOf(response),
    ...bodyOf(response),
    ...goalOf(response),
    currencyCode: response.currencyCode ?? null,
    trainerStyle: optional(response.trainerStyle, trainerStyles.toDomainOrNull),
    languageCode: response.languageCode ?? null,
    createdAt: new Date(response.createdOnUtc),
    updatedAt: optional(response.updatedOnUtc, toDate),
  };
}

export function toWeightEntry(response: WeightLogResponse): WeightEntry {
  return {
    id: response.id,
    weightKg: response.weightKg,
    source: weightSources.toDomain(response.source),
    note: response.note ?? null,
    loggedAt: new Date(response.loggedOnUtc),
  };
}

function identityOf(response: SoldierResponse) {
  return {
    profileId: response.profileId,
    userId: response.userId,
    firstName: response.firstName,
    lastName: response.lastName,
    userName: response.userName,
    fullName: fullName(response.firstName, response.lastName, response.userName),
    dateOfBirth: new Date(response.dateOfBirth),
    gender: genders.toDomainOrNull(response.gender),
    photoUrl: response.profilePhotoUrl ?? null,
    countryCode: response.countryCode,
    timeZone: response.timeZone,
  };
}

function bodyOf(response: SoldierResponse) {
  return {
    heightCm: response.heightCm ?? null,
    startingWeightKg: response.startingWeightKg ?? null,
    currentWeightKg: response.currentWeightKg ?? null,
    targetWeightKg: response.targetWeightKg ?? null,
    bodyFatPercent: response.bodyFatPercent ?? null,
    bmi: response.bmi ?? null,
  };
}

function goalOf(response: SoldierResponse) {
  return {
    experienceLevel: optional(response.experienceLevel, experienceLevels.toDomainOrNull),
    activityLevel: optional(response.activityLevel, activityLevels.toDomainOrNull),
    isHomeWorkout: response.isHomeWorkout ?? null,
    goal: optional(response.goal, fitnessGoals.toDomainOrNull),
    goalPace: optional(response.goalPace, goalPaces.toDomainOrNull),
    workoutDaysPerWeek: response.workoutDaysPerWeek ?? null,
    trainingDays: (response.trainingDays ?? []).filter(isWeekDay),
    goalStartDate: optional(response.goalStartDate, toDate),
    goalTargetDate: optional(response.goalTargetDate, toDate),
    autoAdjustPlanEnabled: response.autoAdjustPlanEnabled ?? null,
    estimatedWeeksToGoal: response.estimatedWeeksToGoal ?? null,
  };
}

function optional<TApi, TDomain>(
  value: TApi | null | undefined,
  map: (value: TApi) => TDomain | null,
): TDomain | null {
  return value === null || value === undefined ? null : map(value);
}

function toDate(value: string): Date {
  return new Date(value);
}

function isWeekDay(value: number): value is WeekDay {
  return (WEEK_DAYS as readonly number[]).includes(value);
}
