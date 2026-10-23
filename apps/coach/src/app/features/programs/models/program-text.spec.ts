import { mealProgramTitle, workoutMeta } from './program-text';

const translate = (key: string, params?: Record<string, string | number>) =>
  params === undefined ? key : `${key}:${Object.values(params).join(',')}`;

describe('program texts', () => {
  it('should join days, level and place for a workout program', () => {
    expect(
      workoutMeta(
        {
          id: 'w',
          name: 'n',
          goal: null,
          experienceLevel: 'beginner',
          isHomeWorkout: true,
          isPublished: false,
          dayCount: 3,
        },
        translate,
      ),
    ).toBe('coachApp.programs.daysCount:3 · coachApp.experience.beginner · coachApp.place.home');
  });

  it('should fall back from the name to the goal and then to the generic title', () => {
    const base = { id: 'm', name: '', goal: null, isPublished: false, mealCount: 0 };

    expect(mealProgramTitle({ ...base, name: 'Cut' }, translate)).toBe('Cut');
    expect(mealProgramTitle({ ...base, goal: 'maintain' }, translate)).toBe(
      'coachApp.goals.maintainWeight',
    );
    expect(mealProgramTitle(base, translate)).toBe('coachApp.meal.programDetailTitle');
  });
});
