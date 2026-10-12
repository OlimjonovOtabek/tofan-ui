import { FITNESS_GOALS } from './fitness-goal';
import { FitnessGoalDto, fitnessGoals } from './fitness-goal.dto';
import { MEAL_TYPES } from './meal-type';
import { MealTypeDto, mealTypes } from './meal-type.dto';

describe('coach fitness enum maps', () => {
  it('should map every fitness goal to its backend number and back', () => {
    expect(FITNESS_GOALS.map((goal) => fitnessGoals.toApi(goal))).toEqual([1, 2, 3, 4]);
    expect(fitnessGoals.toDomain(FitnessGoalDto.Recomposition)).toBe('recomposition');
  });

  it('should map every meal type to its backend number and back', () => {
    expect(MEAL_TYPES.map((type) => mealTypes.toApi(type))).toEqual([1, 2, 3, 4, 5, 6]);
    expect(mealTypes.toDomain(MealTypeDto.PreWorkout)).toBe('preWorkout');
  });

  it('should fail loudly when the backend returns a number the panel does not know', () => {
    expect(() => mealTypes.toDomain(42 as MealTypeDto)).toThrow();
  });
});
