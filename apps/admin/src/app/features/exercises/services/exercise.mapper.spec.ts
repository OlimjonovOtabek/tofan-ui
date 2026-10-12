import {
  EquipmentTypeDto,
  ExerciseDifficultyDto,
  ExerciseGenderDto,
  ExerciseTypeDto,
  MuscleGroupDto,
} from '@shared/models/exercise-attributes.dto';
import { toCreateExerciseRequest, toExercise } from './exercise.mapper';

describe('exercise mapper', () => {
  const response = {
    id: '7',
    name: 'Squat',
    nameUz: 'Skvat',
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

  it('should build the entity when a response arrives', () => {
    const exercise = toExercise(response);

    expect(exercise.names.uz).toBe('Skvat');
    expect(exercise.muscleGroup).toBe('quadriceps');
    expect(exercise.equipmentType).toBe('barbell');
    expect(exercise.difficulty).toBe('intermediate');
    expect(exercise.type).toBe('strength');
    expect(exercise.gender).toBe('any');
    expect(exercise.hasVideo()).toBe(false);
  });

  it('should leave the optional fields out when they are empty', () => {
    const request = toCreateExerciseRequest({
      name: 'Squat',
      nameUz: 'Skvat',
      nameRu: 'Приседание',
      muscleGroup: 'quadriceps',
      equipmentType: 'barbell',
      difficulty: 'intermediate',
      type: 'strength',
      gender: 'any',
      isCompound: true,
      isHomeExercise: false,
      instructions: null,
      videoFileId: null,
    });

    expect(request).not.toHaveProperty('instructions');
    expect(request).not.toHaveProperty('videoFileId');
    expect(request.muscleGroup).toBe(MuscleGroupDto.Quadriceps);
  });
});
