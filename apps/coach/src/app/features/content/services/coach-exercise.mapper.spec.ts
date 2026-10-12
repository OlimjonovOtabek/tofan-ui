import {
  EquipmentTypeDto,
  ExerciseDifficultyDto,
  ExerciseGenderDto,
  ExerciseTypeDto,
  MuscleGroupDto,
} from '@shared/models/exercise-attributes.dto';
import { CoachExerciseResponse } from './coach-content.dto';
import { toCoachExercise, toCoachExerciseRequest } from './coach-exercise.mapper';

const response: CoachExerciseResponse = {
  id: 'e1',
  name: 'Squat',
  nameUz: 'O‘tirib turish',
  nameRu: 'Приседание',
  muscleGroup: MuscleGroupDto.Quadriceps,
  equipmentType: EquipmentTypeDto.Barbell,
  difficulty: ExerciseDifficultyDto.Intermediate,
  type: ExerciseTypeDto.Strength,
  gender: ExerciseGenderDto.Any,
  isCompound: true,
  isHomeExercise: false,
  isActive: true,
  instructions: null,
  videoFileId: null,
};

describe('coach exercise mapper', () => {
  it('should name the backend numbers when an exercise arrives', () => {
    expect(toCoachExercise(response)).toMatchObject({
      muscleGroup: 'quadriceps',
      equipmentType: 'barbell',
      difficulty: 'intermediate',
      type: 'strength',
      gender: 'any',
    });
  });

  it('should send the backend numbers when a draft is saved', () => {
    const { id, isActive, ...draft } = toCoachExercise(response);

    expect(id).toBe('e1');
    expect(isActive).toBe(true);
    expect(toCoachExerciseRequest(draft)).toMatchObject({
      muscleGroup: MuscleGroupDto.Quadriceps,
      equipmentType: EquipmentTypeDto.Barbell,
      difficulty: ExerciseDifficultyDto.Intermediate,
      type: ExerciseTypeDto.Strength,
      gender: ExerciseGenderDto.Any,
    });
  });

  it('should fail loudly when the backend returns a muscle group the panel does not know', () => {
    expect(() => toCoachExercise({ ...response, muscleGroup: 99 as MuscleGroupDto })).toThrow();
  });
});
