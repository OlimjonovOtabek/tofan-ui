import {
  EQUIPMENT_TYPES,
  EXERCISE_DIFFICULTIES,
  EXERCISE_GENDERS,
  EXERCISE_TYPES,
  MUSCLE_GROUPS,
} from '@domain/exercises/exercise-attributes';
import {
  EquipmentType,
  ExerciseDifficulty,
  ExerciseGender,
  ExerciseType,
  MuscleGroup,
} from '@infrastructure/api/generated';
import { EnumMap } from '@infrastructure/api/enum-map';
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
  it('maps every domain value the catalog offers', () => {
    expectRoundTrip(MUSCLE_GROUPS, muscleGroups);
    expectRoundTrip(EQUIPMENT_TYPES, equipmentTypes);
    expectRoundTrip(EXERCISE_DIFFICULTIES, difficulties);
    expectRoundTrip(EXERCISE_TYPES, exerciseTypes);
    expectRoundTrip(EXERCISE_GENDERS, genders);
  });

  it('refuses a value the generated client does not know', () => {
    expect(() => muscleGroups.toApi('triceps-brachii' as never)).toThrow(/Regenerate/);
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

  it('maps a response into the entity', () => {
    const exercise = toExercise(response);

    expect(exercise.displayName).toBe('Skvat');
    expect(exercise.muscleGroup).toBe('quadriceps');
    expect(exercise.equipmentType).toBe('barbell');
    expect(exercise.difficulty).toBe('intermediate');
    expect(exercise.type).toBe('strength');
    expect(exercise.gender).toBe('any');
    expect(exercise.hasVideo()).toBe(false);
  });

  it('leaves the optional fields out of a create request', () => {
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
