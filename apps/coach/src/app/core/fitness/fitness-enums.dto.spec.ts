import { FITNESS_GOALS } from './fitness-goal';
import { FitnessGoalDto, fitnessGoals } from './fitness-goal.dto';
import { EXPERIENCE_LEVELS } from './experience-level';
import { experienceLevels } from './experience-level.dto';
import { SERVING_UNITS } from './serving-unit';
import { servingUnits } from './serving-unit.dto';

describe('coach fitness enum maps', () => {
  it('should map every fitness goal to its backend number and back', () => {
    expect(FITNESS_GOALS.map((goal) => fitnessGoals.toApi(goal))).toEqual([1, 2, 3, 4]);
    expect(fitnessGoals.toDomain(FitnessGoalDto.Recomposition)).toBe('recomposition');
  });

  it('should map experience levels and serving units in backend order', () => {
    expect(EXPERIENCE_LEVELS.map((level) => experienceLevels.toApi(level))).toEqual([1, 2, 3]);
    expect(SERVING_UNITS.map((unit) => servingUnits.toApi(unit))).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});
