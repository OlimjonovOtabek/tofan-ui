import { EXPERIENCE_LEVELS, WEEKDAYS, WORKOUT_SPLITS } from '../models/coach-program-attributes';
import {
  DayOfWeekDto,
  WorkoutSplitTypeDto,
  experienceLevels,
  weekdays,
  workoutSplits,
} from './coach-program-attributes.dto';

describe('coach program enum maps', () => {
  it('should map every experience level, weekday and split to its backend number', () => {
    expect(EXPERIENCE_LEVELS.map((level) => experienceLevels.toApi(level))).toEqual([1, 2, 3]);
    expect(WEEKDAYS.map((day) => weekdays.toApi(day))).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(WORKOUT_SPLITS.map((split) => workoutSplits.toApi(split))).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('should name the backend numbers', () => {
    expect(weekdays.toDomain(DayOfWeekDto.Sunday)).toBe('sunday');
    expect(workoutSplits.toDomain(WorkoutSplitTypeDto.PushPullLegs)).toBe('pushPullLegs');
  });
});
