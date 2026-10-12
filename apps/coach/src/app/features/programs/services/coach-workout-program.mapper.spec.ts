import { FitnessGoalDto } from '@coach/core/fitness/fitness-goal.dto';
import { FitnessExperienceLevelDto, WorkoutPlanSourceDto } from './coach-program-attributes.dto';
import {
  toCreateWorkoutProgramRequest,
  toWorkoutPlan,
  toWorkoutProgram,
} from './coach-workout-program.mapper';

describe('coach workout program mapper', () => {
  it('should name the goal and level when a program summary arrives', () => {
    const program = toWorkoutProgram({
      id: 'w1',
      name: 'Strength',
      goal: FitnessGoalDto.GainMuscle,
      experienceLevel: FitnessExperienceLevelDto.Beginner,
      isHomeWorkout: false,
      isPublished: true,
      dayCount: 3,
      createdOnUtc: '2026-10-01T00:00:00Z',
    });

    expect(program).toMatchObject({ goal: 'gainMuscle', experienceLevel: 'beginner', dayCount: 3 });
  });

  it('should keep only the fields the editor shows when a plan arrives', () => {
    const plan = toWorkoutPlan({
      id: 'w1',
      userId: 'u1',
      name: 'Strength',
      goal: FitnessGoalDto.Maintain,
      experienceLevel: FitnessExperienceLevelDto.Advanced,
      source: WorkoutPlanSourceDto.Trainer,
      isHomeWorkout: true,
      startDate: '2026-10-01T00:00:00Z',
      endDate: null,
      isActive: false,
      isCustomized: false,
      createdOnUtc: '2026-10-01T00:00:00Z',
    });

    expect(plan).toEqual({
      id: 'w1',
      name: 'Strength',
      goal: 'maintain',
      experienceLevel: 'advanced',
      isHomeWorkout: true,
    });
  });

  it('should send the backend numbers when a program is created', () => {
    const request = toCreateWorkoutProgramRequest({
      name: 'Strength',
      goal: 'loseWeight',
      experienceLevel: 'intermediate',
      isHomeWorkout: false,
    });

    expect(request).toEqual({
      name: 'Strength',
      goal: FitnessGoalDto.LoseWeight,
      experienceLevel: FitnessExperienceLevelDto.Intermediate,
      isHomeWorkout: false,
    });
  });
});
