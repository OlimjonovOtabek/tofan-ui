import { Exercise } from './exercise';

function exerciseWithVideo(videoFileId: string | null, videoUrl: string | null): Exercise {
  return new Exercise(
    '7',
    { en: 'Squat', uz: 'Skvat', ru: 'Приседание' },
    'quadriceps',
    'barbell',
    'intermediate',
    'strength',
    'any',
    true,
    false,
    true,
    null,
    videoFileId,
    videoUrl,
  );
}

describe('Exercise', () => {
  describe('playableVideoUrl', () => {
    it('should return the signed url when the saved video is still attached', () => {
      const exercise = exerciseWithVideo('8a0', '/api/files/8a0/content?signature=x');

      expect(exercise.playableVideoUrl('8a0')).toBe('/api/files/8a0/content?signature=x');
    });

    it('should return null when a different video was uploaded', () => {
      const exercise = exerciseWithVideo('8a0', '/api/files/8a0/content?signature=x');

      expect(exercise.playableVideoUrl('c71')).toBeNull();
    });

    it('should return null when the video was removed', () => {
      const exercise = exerciseWithVideo('8a0', '/api/files/8a0/content?signature=x');

      expect(exercise.playableVideoUrl(null)).toBeNull();
    });

    it('should return null when the backend sent no signed url', () => {
      expect(exerciseWithVideo('8a0', null).playableVideoUrl('8a0')).toBeNull();
    });
  });
});
