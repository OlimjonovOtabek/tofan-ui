import {
  EQUIPMENT_TYPES,
  EXERCISE_DIFFICULTIES,
  EXERCISE_GENDERS,
  EXERCISE_TYPES,
  MUSCLE_GROUPS,
} from '../models/exercise-attributes';
import {
  EquipmentType,
  ExerciseDifficulty,
  ExerciseGender,
  ExerciseType,
  MuscleGroup,
} from './exercise.dto';
import { EnumMap } from '@shared/utils/enum-map';
import {
  difficulties,
  equipmentTypes,
  exerciseTypes,
  genders,
  muscleGroups,
  toCreateExerciseRequest,
  toExercise,
} from './exercise.mapper';

function expectRoundTrip<TDomain extends string, TApi extends number>(
  values: readonly TDomain[],
  map: EnumMap<TDomain, TApi>,
): void {
  for (const value of values) {
    const apiValue = map.toApi(value);
    expect(typeof apiValue).toBe('number');
    expect(map.toDomain(apiValue)).toBe(value);
  }
}

describe('exercise enum maps', () => {
  it('should map every catalog value when converting enums both ways', () => {
    expectRoundTrip(MUSCLE_GROUPS, muscleGroups);
    expectRoundTrip(EQUIPMENT_TYPES, equipmentTypes);
    expectRoundTrip(EXERCISE_DIFFICULTIES, difficulties);
    expectRoundTrip(EXERCISE_TYPES, exerciseTypes);
    expectRoundTrip(EXERCISE_GENDERS, genders);
  });

  it('should throw when the DTO enum does not know the value', () => {
    expect(() => muscleGroups.toApi('triceps-brachii' as never)).toThrow(/DTO enum/);
  });
});

describe('exercise mapper', () => {
  const response = {
    id: '7',
    name: 'Squat',
    nameUz: 'Skvat',
    nameRu: 'Приседание',
    muscleGroup: MuscleGroup.Quadriceps,
    equipmentType: EquipmentType.Barbell,
    difficulty: ExerciseDifficulty.Intermediate,
    type: ExerciseType.Strength,
    gender: ExerciseGender.Any,
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
    expect(request.muscleGroup).toBe(MuscleGroup.Quadriceps);
  });
});
