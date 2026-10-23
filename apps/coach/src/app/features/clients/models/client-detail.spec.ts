import {
  ageOf,
  calorieIntakePercent,
  completionProgress,
  weightChangeKg,
  weightProgress,
} from './client-detail';
import { ClientProfile } from './client-detail';

const profile: ClientProfile = {
  firstName: 'A',
  lastName: 'B',
  photoUrl: null,
  dateOfBirth: null,
  heightCm: null,
  startingWeightKg: 90,
  currentWeightKg: 85,
  targetWeightKg: 80,
  goal: null,
  experienceLevel: null,
  isHomeWorkout: null,
  workoutDaysPerWeek: null,
};

describe('client detail rules', () => {
  it('should measure weight change and progress toward the target', () => {
    expect(weightChangeKg(profile)).toBe(-5);
    expect(weightProgress(profile)).toBe(0.5);
    expect(weightProgress({ ...profile, currentWeightKg: 70 })).toBe(1);
    expect(weightProgress({ ...profile, targetWeightKg: 90 })).toBeNull();
    expect(weightChangeKg({ ...profile, startingWeightKg: null })).toBeNull();
  });

  it('should compute completion and intake only when there is something to divide by', () => {
    expect(
      completionProgress({ scheduledDays: 4, completedDays: 3, missedDays: 1, percent: 75 }),
    ).toBe(0.75);
    expect(
      completionProgress({ scheduledDays: 0, completedDays: 0, missedDays: 0, percent: 0 }),
    ).toBeNull();
    expect(calorieIntakePercent({ consumedCalories: 1500, targetCalories: 2000 } as never)).toBe(
      75,
    );
    expect(calorieIntakePercent({ consumedCalories: 1, targetCalories: 0 } as never)).toBeNull();
  });

  it('should count full years only', () => {
    expect(ageOf(new Date(1990, 5, 15), new Date(2026, 5, 14))).toBe(35);
    expect(ageOf(new Date(1990, 5, 15), new Date(2026, 5, 15))).toBe(36);
  });
});
