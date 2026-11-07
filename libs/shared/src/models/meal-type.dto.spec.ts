import { MEAL_TYPES } from './meal-type';
import { MealTypeDto, mealTypes } from './meal-type.dto';

describe('meal types enum map', () => {
  it('should map every meal type to its backend number and back when converting both ways', () => {
    for (const type of MEAL_TYPES) {
      expect(mealTypes.toDomain(mealTypes.toApi(type))).toBe(type);
    }
    expect(MEAL_TYPES.map((type) => mealTypes.toApi(type))).toEqual([1, 7, 2, 4, 3, 5, 6]);
  });

  it('should name the DTO members the way the backend does when exposing the enum', () => {
    expect(MealTypeDto.Breakfast).toBe(1);
    expect(MealTypeDto.Lunch).toBe(2);
    expect(MealTypeDto.Dinner).toBe(3);
    expect(MealTypeDto.Snack).toBe(4);
    expect(MealTypeDto.PreWorkout).toBe(5);
    expect(MealTypeDto.PostWorkout).toBe(6);
    expect(MealTypeDto.SecondBreakfast).toBe(7);
  });

  it('should read the camelCase domain names when converting from the API', () => {
    expect(mealTypes.toDomain(MealTypeDto.SecondBreakfast)).toBe('secondBreakfast');
    expect(mealTypes.toDomain(MealTypeDto.PreWorkout)).toBe('preWorkout');
  });

  it('should fail loudly when the backend returns a number the panel does not know', () => {
    expect(() => mealTypes.toDomain(42 as MealTypeDto)).toThrow(/unknown enum value/);
  });
});
