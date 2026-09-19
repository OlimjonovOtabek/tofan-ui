import { WEEK_DAYS, WeekDay } from './soldier-attributes';
import {
  ACTIVITY_LEVEL_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  FITNESS_GOAL_LABELS,
  GENDER_LABELS,
  GOAL_PACE_LABELS,
  TRAINER_STYLE_LABELS,
  WEEK_DAY_LABELS,
} from './soldier-labels';
import { SoldierProfile, ageOn, roundToTenth, weightLeftKg } from './soldier-profile';

export interface SoldierFact {
  readonly label: string;
  readonly value: string;
}

export interface SoldierFactSection {
  readonly title: string;
  readonly facts: readonly SoldierFact[];
}

export const MISSING_VALUE = '—';

const MONDAY_FIRST: readonly WeekDay[] = [...WEEK_DAYS.slice(1), 0];

export function toSoldierFactSections(profile: SoldierProfile, now: Date): SoldierFactSection[] {
  return [
    { title: 'Shaxsiy', facts: personalFacts(profile, now) },
    { title: 'Tana', facts: bodyFacts(profile) },
    { title: 'Maqsad va mashg‘ulot', facts: goalFacts(profile) },
    { title: 'Sozlamalar', facts: settingFacts(profile) },
  ];
}

function personalFacts(profile: SoldierProfile, now: Date): SoldierFact[] {
  return [
    {
      label: 'Tug‘ilgan sana',
      value: `${dateLabel(profile.dateOfBirth)} (${ageOn(profile.dateOfBirth, now)} yosh)`,
    },
    { label: 'Jinsi', value: GENDER_LABELS[profile.gender] },
    { label: 'Davlat', value: profile.countryCode },
    { label: 'Vaqt zonasi', value: profile.timeZone },
  ];
}

function bodyFacts(profile: SoldierProfile): SoldierFact[] {
  return [
    { label: 'Bo‘yi', value: withUnit(profile.heightCm, 'sm') },
    { label: 'Boshlang‘ich vazn', value: withUnit(profile.startingWeightKg, 'kg') },
    { label: 'Hozirgi vazn', value: withUnit(profile.currentWeightKg, 'kg') },
    { label: 'Maqsad vazn', value: withUnit(profile.targetWeightKg, 'kg') },
    { label: 'Maqsadgacha', value: signedKg(weightLeftKg(profile)) },
    { label: 'Yog‘ foizi', value: withUnit(profile.bodyFatPercent, '%') },
    { label: 'BMI', value: withUnit(profile.bmi, '') },
  ];
}

function goalFacts(profile: SoldierProfile): SoldierFact[] {
  return [
    { label: 'Maqsad', value: labelOf(profile.goal, FITNESS_GOAL_LABELS) },
    { label: 'Sur’at', value: labelOf(profile.goalPace, GOAL_PACE_LABELS) },
    { label: 'Tajriba', value: labelOf(profile.experienceLevel, EXPERIENCE_LEVEL_LABELS) },
    { label: 'Faollik', value: labelOf(profile.activityLevel, ACTIVITY_LEVEL_LABELS) },
    { label: 'Joyi', value: workoutPlace(profile.isHomeWorkout) },
    { label: 'Haftada', value: withUnit(profile.workoutDaysPerWeek, 'kun') },
    { label: 'Mashg‘ulot kunlari', value: trainingDaysLabel(profile.trainingDays) },
    { label: 'Maqsad davri', value: goalPeriod(profile.goalStartDate, profile.goalTargetDate) },
    { label: 'Maqsadgacha taxminan', value: withUnit(profile.estimatedWeeksToGoal, 'hafta') },
    { label: 'Rejani avto-moslash', value: yesNo(profile.autoAdjustPlanEnabled) },
  ];
}

function settingFacts(profile: SoldierProfile): SoldierFact[] {
  return [
    { label: 'Murabbiy uslubi', value: labelOf(profile.trainerStyle, TRAINER_STYLE_LABELS) },
    { label: 'Til', value: profile.languageCode ?? MISSING_VALUE },
    { label: 'Valyuta', value: profile.currencyCode ?? MISSING_VALUE },
  ];
}

export function dateLabel(date: Date): string {
  return date.toLocaleDateString('uz-UZ', { dateStyle: 'short', timeZone: 'UTC' });
}

function withUnit(value: number | null, unit: string): string {
  return value === null ? MISSING_VALUE : `${roundToTenth(value)} ${unit}`.trim();
}

function signedKg(value: number | null): string {
  if (value === null) {
    return MISSING_VALUE;
  }
  return value > 0 ? `+${value} kg` : `${value} kg`;
}

function labelOf<TValue extends string>(
  value: TValue | null,
  labels: Record<TValue, string>,
): string {
  return value === null ? MISSING_VALUE : labels[value];
}

function workoutPlace(isHomeWorkout: boolean | null): string {
  if (isHomeWorkout === null) {
    return MISSING_VALUE;
  }
  return isHomeWorkout ? 'Uyda' : 'Zalda';
}

function yesNo(value: boolean | null): string {
  if (value === null) {
    return MISSING_VALUE;
  }
  return value ? 'Yoqilgan' : 'O‘chirilgan';
}

function trainingDaysLabel(days: readonly WeekDay[]): string {
  const ordered = MONDAY_FIRST.filter((day) => days.includes(day));
  return ordered.length === 0
    ? MISSING_VALUE
    : ordered.map((day) => WEEK_DAY_LABELS[day]).join(', ');
}

function goalPeriod(start: Date | null, target: Date | null): string {
  if (start === null && target === null) {
    return MISSING_VALUE;
  }
  const from = start === null ? MISSING_VALUE : dateLabel(start);
  const to = target === null ? MISSING_VALUE : dateLabel(target);
  return `${from} → ${to}`;
}
