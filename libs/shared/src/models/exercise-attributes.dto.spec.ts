import { EnumMap } from '@shared/utils/enum-map';
import {
  EQUIPMENT_TYPES,
  EXERCISE_DIFFICULTIES,
  EXERCISE_GENDERS,
  EXERCISE_TYPES,
  MUSCLE_GROUPS,
} from './exercise-attributes';
import {
  difficulties,
  equipmentTypes,
  exerciseTypes,
  genders,
  muscleGroups,
} from './exercise-attributes.dto';

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
