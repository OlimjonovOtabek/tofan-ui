import { WorkoutPlanDay } from './coach-program.dto';
import { toCreateDayRequest, toUpdateDayRequest, toWorkoutDayDraft } from './coach-workout-day.mapper';

const day: WorkoutPlanDay = {
  id: 'd1',
  workoutPlanId: 'w1',
  dayOfWeek: 1,
  splitType: 2,
  title: 'Legs',
  isRestDay: false,
  displayOrder: 0,
  exercises: [
    {
      id: 'x1',
      exercise: { id: 'e1', name: 'Squat', nameRu: 'Приседание', nameUz: 'O‘tirib turish' },
      targetSets: 4,
      targetReps: '6-8',
      restSeconds: 90,
      targetWeightKg: 80,
      displayOrder: 0,
    },
  ],
};

describe('coach workout day mapper', () => {
  it('should flatten the exercise names into the draft when a day is opened', () => {
    const draft = toWorkoutDayDraft(day);

    expect(draft).toMatchObject({ key: 'd1', id: 'd1', title: 'Legs' });
    expect(draft.exercises[0]).toMatchObject({ key: 'x1', exerciseId: 'e1', nameUz: 'O‘tirib turish', targetSets: 4 });
  });

  it('should send the plan id only when a day is created', () => {
    const draft = toWorkoutDayDraft(day);
    const exercises = [{ exerciseId: 'e1', targetSets: 4, targetReps: '6-8', restSeconds: 90, targetWeightKg: 80 }];

    expect(toCreateDayRequest(draft)).toMatchObject({ workoutPlanId: 'w1', title: 'Legs', exercises });
    expect(toUpdateDayRequest(draft)).toEqual({
      dayOfWeek: 1,
      splitType: 2,
      title: 'Legs',
      isRestDay: false,
      displayOrder: 0,
      exercises,
    });
  });
});
