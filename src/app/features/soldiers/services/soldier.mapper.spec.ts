import { toSoldierProfile, toSoldierSummary, toWeightEntry } from './soldier.mapper';
import { Gender, SoldierResponse } from './soldier.dto';

const detail: SoldierResponse = {
  profileId: '70454f3e-a449-467f-b867-7be5d994d3e2',
  userId: 'c461dfe9-405f-4266-9e37-22e937f20f0c',
  firstName: 'R',
  lastName: 'T',
  userName: 'wread1789396498',
  dateOfBirth: '1995-05-05T00:00:00Z',
  gender: 1,
  profilePhotoUrl: null,
  countryCode: 'UZ',
  timeZone: 'Asia/Tashkent',
  heightCm: 180,
  startingWeightKg: 85,
  currentWeightKg: 78,
  targetWeightKg: 72,
  bodyFatPercent: null,
  experienceLevel: 1,
  activityLevel: 3,
  isHomeWorkout: false,
  goal: 1,
  goalPace: 2,
  workoutDaysPerWeek: 3,
  trainingDays: [1, 3, 5],
  goalStartDate: null,
  goalTargetDate: null,
  autoAdjustPlanEnabled: true,
  currencyCode: 'UZS',
  trainerStyle: 1,
  languageCode: 'uz',
  bmi: 24.07,
  estimatedWeeksToGoal: 12,
  createdOnUtc: '2026-09-14T14:35:00.343645Z',
  updatedOnUtc: '2026-09-14T14:35:00.343645Z',
};

describe('soldier mapper', () => {
  it('should map the enums by name when a list row arrives', () => {
    const soldier = toSoldierSummary({
      userId: 'c461dfe9-405f-4266-9e37-22e937f20f0c',
      firstName: 'Ali',
      lastName: 'Valiyev',
      userName: 'ali_v',
      gender: 2,
      countryCode: 'UZ',
      goal: 4,
      experienceLevel: 3,
      currentWeightKg: 85.4,
      targetWeightKg: 78,
      isHomeWorkout: true,
      createdOnUtc: '2026-08-01T10:00:00Z',
    });

    expect(soldier.fullName).toBe('Ali Valiyev');
    expect(soldier.gender).toBe('female');
    expect(soldier.goal).toBe('recomposition');
    expect(soldier.experienceLevel).toBe('advanced');
    expect(soldier.joinedAt.toISOString()).toBe('2026-08-01T10:00:00.000Z');
  });

  it('should keep missing body and goal data empty when the soldier has no such profile', () => {
    const soldier = toSoldierSummary({
      userId: 'c461dfe9-405f-4266-9e37-22e937f20f0c',
      firstName: '',
      lastName: '',
      userName: 'ali_v',
      gender: 1,
      countryCode: 'UZ',
      goal: null,
      experienceLevel: null,
      currentWeightKg: null,
      targetWeightKg: null,
      isHomeWorkout: null,
      createdOnUtc: '2026-08-01T10:00:00Z',
    });

    expect(soldier.goal).toBeNull();
    expect(soldier.isHomeWorkout).toBeNull();
    expect(soldier.fullName).toBe('ali_v');
  });

  it('should leave the gender empty when the backend stores a value outside the enum', () => {
    const soldier = toSoldierSummary({
      userId: 'fe0bfbd9-6fa7-4d89-8812-fd316828e5ed',
      firstName: 'Abdulhakim',
      lastName: 'Abdurahimov',
      userName: 'abdulhakim',
      gender: 0 as Gender,
      countryCode: 'UZ',
      createdOnUtc: '2026-09-22T22:53:48.922381Z',
    });

    expect(soldier.gender).toBeNull();
    expect(toSoldierProfile({ ...detail, gender: 0 as Gender }).gender).toBeNull();
  });

  it('should map the card with dates and training days when a profile arrives', () => {
    const profile = toSoldierProfile(detail);

    expect(profile.fullName).toBe('R T');
    expect(profile.activityLevel).toBe('moderate');
    expect(profile.goalPace).toBe('moderate');
    expect(profile.trainerStyle).toBe('soft');
    expect(profile.trainingDays).toEqual([1, 3, 5]);
    expect(profile.dateOfBirth.toISOString()).toBe('1995-05-05T00:00:00.000Z');
    expect(profile.goalStartDate).toBeNull();
  });

  it('should drop unknown days when the backend sends no training days', () => {
    expect(toSoldierProfile({ ...detail, trainingDays: null }).trainingDays).toEqual([]);
    expect(toSoldierProfile({ ...detail, trainingDays: [0, 9] }).trainingDays).toEqual([0]);
  });

  it('should map the weight source when a weight log arrives', () => {
    const entry = toWeightEntry({
      id: '8dcec9f3',
      weightKg: 80,
      source: 3,
      note: null,
      loggedOnUtc: '2026-09-14T14:35:00Z',
    });

    expect(entry.source).toBe('healthSync');
    expect(entry.loggedAt.toISOString()).toBe('2026-09-14T14:35:00.000Z');
  });
});
