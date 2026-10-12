import { AppLocale } from '@core/i18n/locale';
import { toSoldierFactSections } from './soldier-facts';
import { toJoinedPeriod } from './soldier-filter';
import { SoldierProfile, ageOn, weightLeftKg } from './soldier-profile';
import { weightChange } from './weight-entry';

const profile: SoldierProfile = {
  profileId: 'p',
  userId: 'u',
  firstName: 'R',
  lastName: 'T',
  userName: 'rt',
  fullName: 'R T',
  dateOfBirth: new Date('1995-05-05T00:00:00Z'),
  gender: 'male',
  photoUrl: null,
  countryCode: 'UZ',
  timeZone: 'Asia/Tashkent',
  heightCm: 180,
  startingWeightKg: 85,
  currentWeightKg: 78.4,
  targetWeightKg: 72,
  bodyFatPercent: null,
  experienceLevel: 'beginner',
  activityLevel: 'moderate',
  isHomeWorkout: false,
  goal: 'loseWeight',
  goalPace: 'moderate',
  workoutDaysPerWeek: 3,
  trainingDays: [5, 0, 1],
  goalStartDate: null,
  goalTargetDate: null,
  autoAdjustPlanEnabled: true,
  currencyCode: 'UZS',
  trainerStyle: 'soft',
  languageCode: 'uz',
  bmi: 24.07,
  estimatedWeeksToGoal: 12,
  createdAt: new Date('2026-09-14T14:35:00Z'),
  updatedAt: null,
};

function factValue(label: string, locale: AppLocale = 'uz'): string | undefined {
  return toSoldierFactSections(profile, new Date('2026-09-19T00:00:00Z'), locale)
    .flatMap((section) => section.facts)
    .find((fact) => fact.label === label)?.value;
}

describe('soldier rules', () => {
  it('should count full years only when the birthday has not come yet', () => {
    const born = new Date('1995-05-05T00:00:00Z');

    expect(ageOn(born, new Date('2026-05-04T23:59:59Z'))).toBe(30);
    expect(ageOn(born, new Date('2026-05-05T00:00:00Z'))).toBe(31);
  });

  it('should report the kilograms left to the target when both weights are known', () => {
    expect(weightLeftKg(profile)).toBe(-6.4);
    expect(weightLeftKg({ ...profile, targetWeightKg: null })).toBeNull();
  });

  it('should list training days from Monday when the profile has days', () => {
    expect(factValue('Mashg‘ulot kunlari')).toBe('Dushanba, Juma, Yakshanba');
    expect(factValue('Yog‘ foizi')).toBe('—');
    expect(factValue('Maqsadgacha')).toBe('-6.4 kg');
  });

  it('should describe the facts in the locale when it is not Uzbek', () => {
    expect(factValue('Training days', 'en')).toBe('Monday, Friday, Sunday');
    expect(factValue('Рост', 'ru')).toBe('180 см');
  });

  it('should make the last day inclusive when a joined period is picked', () => {
    const period = toJoinedPeriod(new Date(2026, 8, 1, 15, 30), new Date(2026, 8, 30, 9));

    expect(period.joinedFrom).toEqual(new Date(2026, 8, 1));
    expect(period.joinedBefore).toEqual(new Date(2026, 9, 1));
    expect(toJoinedPeriod(null, null)).toEqual({});
  });

  it('should compare the first and the last weight when the history has entries', () => {
    const entry = (weightKg: number) => ({
      id: String(weightKg),
      weightKg,
      source: 'manual' as const,
      note: null,
      loggedAt: new Date(),
    });

    expect(weightChange([entry(80), entry(79.2), entry(78.05)])).toEqual({
      firstKg: 80,
      lastKg: 78.05,
      deltaKg: -2,
    });
    expect(weightChange([])).toBeNull();
  });
});
