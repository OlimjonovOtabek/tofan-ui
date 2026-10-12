import { FitnessGoalDto } from '@coach/core/fitness/fitness-goal.dto';
import { MealTypeDto } from '@coach/core/fitness/meal-type.dto';
import {
  toCoachAdherence,
  toCoachClientProfile,
  toCoachClientSummary,
  toCoachFoodLog,
  toCoachWorkoutSession,
} from './coach-client.mapper';
import { WorkoutSessionStatusDto } from './coach-session-status.dto';

describe('coach client mapper', () => {
  it('should name the goal and fill the missing weights with null when a client arrives', () => {
    const client = toCoachClientSummary({
      userId: 'u1',
      firstName: 'Ali',
      lastName: 'Valiyev',
      goal: FitnessGoalDto.GainMuscle,
      subscribedOnUtc: '2026-10-01T00:00:00Z',
      subscriptionEndsOnUtc: '2026-11-01T00:00:00Z',
    });

    expect(client).toMatchObject({ goal: 'gainMuscle', currentWeightKg: null, targetWeightKg: null });
  });

  it('should keep the goal empty when the client has not chosen one', () => {
    const profile = toCoachClientProfile({
      profileId: 'p1',
      userId: 'u1',
      firstName: 'Ali',
      lastName: 'Valiyev',
      userName: 'ali',
      profilePhotoUrl: null,
      timeZone: 'UTC',
      heightCm: null,
      currentWeightKg: null,
      targetWeightKg: null,
      goal: null,
      goalTargetDate: null,
    });

    expect(profile.goal).toBeNull();
  });

  it('should name the session status', () => {
    const session = toCoachWorkoutSession({
      id: 's1',
      planDayTitle: 'Legs',
      status: WorkoutSessionStatusDto.Skipped,
      startedOnUtc: '2026-10-01T00:00:00Z',
      completedOnUtc: null,
      durationMinutes: 0,
      estimatedCaloriesBurned: 0,
      exerciseCount: 0,
      completedSetCount: 0,
      totalVolumeKg: 0,
    });

    expect(session.status).toBe('skipped');
  });

  it('should name each day status and keep days without a session empty', () => {
    const adherence = toCoachAdherence({
      fromDate: '2026-10-01',
      toDate: '2026-10-02',
      scheduledDays: 2,
      completedDays: 1,
      missedDays: 0,
      restDays: 0,
      adherencePercent: 50,
      days: [
        { date: '2026-10-01', dayOfWeek: 4, isRestDay: false, isMissed: false, sessionStatus: WorkoutSessionStatusDto.Completed },
        { date: '2026-10-02', dayOfWeek: 5, isRestDay: false, isMissed: false, sessionStatus: null },
      ],
    });

    expect(adherence.days.map((day) => day.sessionStatus)).toEqual(['completed', null]);
  });

  it('should name the meal type of a food log', () => {
    const log = toCoachFoodLog({
      id: 'l1',
      foodId: 'f1',
      foodName: 'Apple',
      foodNameRu: 'Яблоко',
      foodNameUz: 'Olma',
      mealType: MealTypeDto.PostWorkout,
      quantityGrams: 150,
      calories: 78,
      proteinGrams: 0,
      carbsGrams: 20,
      fatGrams: 0,
      loggedOnUtc: '2026-10-01T08:00:00Z',
    });

    expect(log.mealType).toBe('postWorkout');
  });

  it('should fail loudly when the backend returns a session status the panel does not know', () => {
    expect(() =>
      toCoachWorkoutSession({
        id: 's1',
        planDayTitle: 'Legs',
        status: 9 as WorkoutSessionStatusDto,
        startedOnUtc: '2026-10-01T00:00:00Z',
        completedOnUtc: null,
        durationMinutes: 0,
        estimatedCaloriesBurned: 0,
        exerciseCount: 0,
        completedSetCount: 0,
        totalVolumeKg: 0,
      }),
    ).toThrow();
  });
});
