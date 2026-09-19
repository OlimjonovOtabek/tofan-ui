import { ExerciseChoice, sortByName } from './exercise-choice';

function choice(id: string, en: string, uz: string, ru: string): ExerciseChoice {
  return { id, names: { en, uz, ru }, isActive: true };
}

describe('sortByName', () => {
  const choices = [
    choice('1', 'Bench press', 'Shtanga bilan jim', 'Жим лёжа'),
    choice('2', 'Squat', 'Skvat', 'Присед'),
    choice('3', 'Plank', 'Planka', 'Планка'),
  ];

  it('should order the exercises by the name of the locale', () => {
    expect(sortByName(choices, 'en').map(({ id }) => id)).toEqual(['1', '3', '2']);
    expect(sortByName(choices, 'uz').map(({ id }) => id)).toEqual(['3', '2', '1']);
    expect(sortByName(choices, 'ru').map(({ id }) => id)).toEqual(['1', '3', '2']);
  });

  it('should leave the original list untouched when it sorts', () => {
    sortByName(choices, 'en');

    expect(choices.map(({ id }) => id)).toEqual(['1', '2', '3']);
  });
});
