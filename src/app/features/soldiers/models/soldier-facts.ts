import { formatCalendarDate } from '@core/i18n/date-format';
import { TranslationKey, TranslationParams } from '@core/i18n/dictionary';
import { AppLocale } from '@core/i18n/locale';
import { translate } from '@core/i18n/translate';
import { WEEK_DAYS, WeekDay } from './soldier-attributes';
import {
  ACTIVITY_LEVEL_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  FITNESS_GOAL_LABELS,
  GENDER_LABELS,
  GOAL_PACE_LABELS,
  TRAINER_STYLE_LABELS,
  WEEK_DAY_LABELS,
  workoutPlaceLabel,
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

type UnitKey = 'cm' | 'kg' | 'percent' | 'days' | 'weeks';

export const MISSING_VALUE = '—';

const MONDAY_FIRST: readonly WeekDay[] = [...WEEK_DAYS.slice(1), 0];

export function toSoldierFactSections(
  profile: SoldierProfile,
  now: Date,
  locale: AppLocale,
): SoldierFactSection[] {
  const facts = new FactWriter(locale);
  return [
    facts.section('soldiers.facts.sections.personal', personalFacts(facts, profile, now)),
    facts.section('soldiers.facts.sections.body', bodyFacts(facts, profile)),
    facts.section('soldiers.facts.sections.goal', goalFacts(facts, profile)),
    facts.section('soldiers.facts.sections.settings', settingFacts(facts, profile)),
  ];
}

function personalFacts(facts: FactWriter, profile: SoldierProfile, now: Date): SoldierFact[] {
  const birthDate = facts.text('soldiers.units.age', {
    date: formatCalendarDate(profile.dateOfBirth, facts.locale),
    age: ageOn(profile.dateOfBirth, now),
  });
  return [
    facts.fact('soldiers.facts.birthDate', birthDate),
    facts.fact('soldiers.facts.gender', facts.text(GENDER_LABELS[profile.gender])),
    facts.fact('soldiers.facts.country', profile.countryCode),
    facts.fact('soldiers.facts.timeZone', profile.timeZone),
  ];
}

function bodyFacts(facts: FactWriter, profile: SoldierProfile): SoldierFact[] {
  return [
    facts.fact('soldiers.facts.height', facts.unit(profile.heightCm, 'cm')),
    facts.fact('soldiers.facts.startingWeight', facts.unit(profile.startingWeightKg, 'kg')),
    facts.fact('soldiers.facts.currentWeight', facts.unit(profile.currentWeightKg, 'kg')),
    facts.fact('soldiers.facts.targetWeight', facts.unit(profile.targetWeightKg, 'kg')),
    facts.fact('soldiers.facts.weightLeft', facts.signedKg(weightLeftKg(profile))),
    facts.fact('soldiers.facts.bodyFat', facts.unit(profile.bodyFatPercent, 'percent')),
    facts.fact('soldiers.facts.bmi', facts.number(profile.bmi)),
  ];
}

function goalFacts(facts: FactWriter, profile: SoldierProfile): SoldierFact[] {
  return [
    facts.fact('soldiers.facts.goal', facts.label(profile.goal, FITNESS_GOAL_LABELS)),
    facts.fact('soldiers.facts.pace', facts.label(profile.goalPace, GOAL_PACE_LABELS)),
    facts.fact(
      'soldiers.facts.experience',
      facts.label(profile.experienceLevel, EXPERIENCE_LEVEL_LABELS),
    ),
    facts.fact(
      'soldiers.facts.activity',
      facts.label(profile.activityLevel, ACTIVITY_LEVEL_LABELS),
    ),
    facts.fact('soldiers.facts.place', facts.workoutPlace(profile.isHomeWorkout)),
    facts.fact('soldiers.facts.perWeek', facts.unit(profile.workoutDaysPerWeek, 'days')),
    facts.fact('soldiers.facts.trainingDays', facts.trainingDays(profile.trainingDays)),
    facts.fact(
      'soldiers.facts.goalPeriod',
      facts.period(profile.goalStartDate, profile.goalTargetDate),
    ),
    facts.fact('soldiers.facts.weeksToGoal', facts.unit(profile.estimatedWeeksToGoal, 'weeks')),
    facts.fact('soldiers.facts.autoAdjust', facts.onOff(profile.autoAdjustPlanEnabled)),
  ];
}

function settingFacts(facts: FactWriter, profile: SoldierProfile): SoldierFact[] {
  return [
    facts.fact(
      'soldiers.facts.trainerStyle',
      facts.label(profile.trainerStyle, TRAINER_STYLE_LABELS),
    ),
    facts.fact('soldiers.facts.language', profile.languageCode ?? MISSING_VALUE),
    facts.fact('soldiers.facts.currency', profile.currencyCode ?? MISSING_VALUE),
  ];
}

class FactWriter {
  constructor(readonly locale: AppLocale) {}

  section(title: TranslationKey, facts: readonly SoldierFact[]): SoldierFactSection {
    return { title: this.text(title), facts };
  }

  fact(label: TranslationKey, value: string): SoldierFact {
    return { label: this.text(label), value };
  }

  text(key: TranslationKey, params?: TranslationParams): string {
    return translate(this.locale, key, params);
  }

  unit(value: number | null, unit: UnitKey): string {
    return value === null
      ? MISSING_VALUE
      : this.text(`soldiers.units.${unit}`, { value: roundToTenth(value) });
  }

  number(value: number | null): string {
    return value === null ? MISSING_VALUE : String(roundToTenth(value));
  }

  signedKg(value: number | null): string {
    if (value === null) {
      return MISSING_VALUE;
    }
    return this.text('soldiers.units.kg', { value: value > 0 ? `+${value}` : value });
  }

  label<TValue extends string>(
    value: TValue | null,
    labels: Record<TValue, TranslationKey>,
  ): string {
    return value === null ? MISSING_VALUE : this.text(labels[value]);
  }

  workoutPlace(isHomeWorkout: boolean | null): string {
    return isHomeWorkout === null ? MISSING_VALUE : this.text(workoutPlaceLabel(isHomeWorkout));
  }

  onOff(value: boolean | null): string {
    if (value === null) {
      return MISSING_VALUE;
    }
    return this.text(value ? 'soldiers.facts.enabled' : 'soldiers.facts.disabled');
  }

  trainingDays(days: readonly WeekDay[]): string {
    const ordered = MONDAY_FIRST.filter((day) => days.includes(day));
    return ordered.length === 0
      ? MISSING_VALUE
      : ordered.map((day) => this.text(WEEK_DAY_LABELS[day])).join(', ');
  }

  period(start: Date | null, target: Date | null): string {
    if (start === null && target === null) {
      return MISSING_VALUE;
    }
    const from = start === null ? MISSING_VALUE : formatCalendarDate(start, this.locale);
    const to = target === null ? MISSING_VALUE : formatCalendarDate(target, this.locale);
    return `${from} → ${to}`;
  }
}
