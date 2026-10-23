import { canSaveDay, dayDraftOf, isUploading, pendingVideoDraft, uploadedCount } from './day-draft';
import { WorkoutDay, dayReadiness, moveItem, publishedFirst } from './workout-program';
import { NEW_WORKOUT_PROGRAM, canSubmitWorkoutProgram } from './workout-program-form';

const day: WorkoutDay = {
  id: 'd1',
  title: 'Push',
  description: '',
  isRestDay: false,
  videos: [
    {
      key: 'e1',
      fileId: 'f1',
      name: { en: 'Bench', uz: 'Jim', ru: 'Жим' },
      videoUrl: '/v',
      hlsUrl: null,
      posterUrl: null,
    },
  ],
  droppedExerciseCount: 0,
};

describe('dayReadiness', () => {
  it('should be ready when the day has a video', () => {
    expect(dayReadiness(day)).toBe('ready');
  });

  it('should be empty when no video is attached and rest when the day is a rest day', () => {
    expect(dayReadiness({ ...day, videos: [] })).toBe('empty');
    expect(dayReadiness({ ...day, isRestDay: true })).toBe('rest');
  });
});

describe('publishedFirst', () => {
  it('should list published programs before drafts and keep their order', () => {
    const list = [
      { id: 'a', isPublished: false },
      { id: 'b', isPublished: true },
      { id: 'c', isPublished: false },
    ];

    expect(publishedFirst(list).map((item) => item.id)).toEqual(['b', 'a', 'c']);
  });
});

describe('moveItem', () => {
  it('should move an item to the new index', () => {
    expect(moveItem(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
  });

  it('should keep the list when an index is out of range', () => {
    expect(moveItem(['a', 'b'], 0, 5)).toEqual(['a', 'b']);
  });
});

describe('canSaveDay', () => {
  it('should allow saving only with a title and fully uploaded videos', () => {
    const draft = dayDraftOf(day, 'uz');

    expect(canSaveDay(draft)).toBe(true);
    expect(canSaveDay({ ...draft, title: '  ' })).toBe(false);
    expect(canSaveDay({ ...draft, videos: [] })).toBe(false);
    expect(
      canSaveDay({ ...draft, videos: [...draft.videos, pendingVideoDraft('n1', 'blob:1')] }),
    ).toBe(false);
  });
});

describe('uploadedCount', () => {
  it('should count only finished uploads', () => {
    const pending = pendingVideoDraft('n1', 'blob:1');
    const failed = { ...pendingVideoDraft('n2', 'blob:2'), uploadFailed: true };
    const draft = {
      ...dayDraftOf(day, 'uz'),
      videos: [...dayDraftOf(day, 'uz').videos, pending, failed],
    };

    expect(isUploading(pending)).toBe(true);
    expect(isUploading(failed)).toBe(false);
    expect(uploadedCount(draft)).toBe(1);
  });
});

describe('canSubmitWorkoutProgram', () => {
  it('should need a name and a goal', () => {
    expect(canSubmitWorkoutProgram(NEW_WORKOUT_PROGRAM)).toBe(false);
    expect(
      canSubmitWorkoutProgram({ ...NEW_WORKOUT_PROGRAM, name: 'Strong', goal: 'gainMuscle' }),
    ).toBe(true);
  });
});
