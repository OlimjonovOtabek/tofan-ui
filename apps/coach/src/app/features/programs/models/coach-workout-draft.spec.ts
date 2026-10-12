import {
  WorkoutDayDraft,
  newWorkoutDay,
  newWorkoutExercise,
  workoutDraftIssue,
} from './coach-workout-draft';

const squat = { id: 'e1', name: 'Squat', nameRu: 'Приседание', nameUz: 'O‘tirib turish' };

function day(values: Partial<WorkoutDayDraft> = {}): WorkoutDayDraft {
  return {
    ...newWorkoutDay('d1', 'w1', 0, { title: 'Legs', dayOfWeek: 'monday', splitType: 'fullBody', isRestDay: false }),
    ...values,
  };
}

describe('coach workout draft', () => {
  it('should create an unsaved day with a trimmed title when a day is added', () => {
    const created = newWorkoutDay('d1', 'w1', 2, { title: '  Legs ', dayOfWeek: 'wednesday', splitType: 'fullBody', isRestDay: false });

    expect(created).toMatchObject({ id: null, title: 'Legs', workoutPlanId: 'w1', displayOrder: 2, exercises: [] });
  });

  it('should give a new exercise the default sets, reps and rest', () => {
    expect(newWorkoutExercise('x1', squat)).toMatchObject({
      exerciseId: 'e1',
      targetSets: 3,
      targetReps: '8-12',
      restSeconds: 60,
      targetWeightKg: null,
    });
  });

  it('should report no issue when every day has a title and valid exercises', () => {
    expect(workoutDraftIssue([day({ exercises: [newWorkoutExercise('x1', squat)] })])).toBeNull();
  });

  it('should report a day title issue when a day title is blank', () => {
    expect(workoutDraftIssue([day({ title: '  ' })])).toBe('dayTitle');
  });

  it('should report an exercise issue when sets are below one or reps are blank', () => {
    const noSets = { ...newWorkoutExercise('x1', squat), targetSets: 0 };
    const noReps = { ...newWorkoutExercise('x2', squat), targetReps: ' ' };

    expect(workoutDraftIssue([day({ exercises: [noSets] })])).toBe('exercise');
    expect(workoutDraftIssue([day({ exercises: [noReps] })])).toBe('exercise');
  });
});
