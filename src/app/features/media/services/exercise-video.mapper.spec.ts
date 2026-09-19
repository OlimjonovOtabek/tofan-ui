import { ExerciseResponse } from './exercise-video.dto';
import { hasNoVideo, toExerciseChoice, toVideoUpdateRequest } from './exercise-video.mapper';

const exercise: ExerciseResponse = {
  id: '7',
  name: 'Squat',
  nameUz: 'Skvat',
  nameRu: 'Присед',
  muscleGroup: 10,
  equipmentType: 2,
  difficulty: 2,
  type: 1,
  gender: 0,
  isCompound: true,
  isHomeExercise: false,
  isActive: false,
  instructions: null,
  videoFileId: null,
};

describe('exercise video mapper', () => {
  it('should offer the exercise with all three names when it has no video', () => {
    expect(hasNoVideo(exercise)).toBe(true);
    expect(toExerciseChoice(exercise)).toEqual({
      id: '7',
      names: { en: 'Squat', uz: 'Skvat', ru: 'Присед' },
      isActive: false,
    });
  });

  it('should skip the exercise when it already has a video', () => {
    expect(hasNoVideo({ ...exercise, videoFileId: 'file-1' })).toBe(false);
  });

  it('should keep every field and set only the video when the update is built', () => {
    const request = toVideoUpdateRequest(exercise, 'file-2');

    expect(request).toEqual({
      name: 'Squat',
      nameUz: 'Skvat',
      nameRu: 'Присед',
      muscleGroup: 10,
      equipmentType: 2,
      difficulty: 2,
      type: 1,
      gender: 0,
      isCompound: true,
      isHomeExercise: false,
      instructions: null,
      videoFileId: 'file-2',
    });
  });
});
