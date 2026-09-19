import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { NotFoundError } from '@shared/models/errors/not-found.error';
import { ExercisesStore } from './exercises.store';
import { Exercise } from './models/exercise';
import { ExerciseDraft } from './models/exercise-draft';
import { ExercisesService } from './services/exercises.service';

const draft: ExerciseDraft = {
  name: ' Squat ',
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
};

function exercise(isActive: boolean): Exercise {
  return new Exercise(
    '7',
    'Squat',
    'Skvat',
    'Приседание',
    'quadriceps',
    'barbell',
    'intermediate',
    'strength',
    'any',
    true,
    false,
    isActive,
  );
}

describe('ExercisesStore', () => {
  let service: Pick<ExercisesService, 'list' | 'create' | 'update' | 'delete' | 'setActive'>;
  let notifications: Pick<NotificationService, 'success' | 'error'>;

  function createStore(): ExercisesStore {
    TestBed.configureTestingModule({
      providers: [
        ExercisesStore,
        { provide: ExercisesService, useValue: service },
        { provide: NotificationService, useValue: notifications },
      ],
    });
    return TestBed.inject(ExercisesStore);
  }

  beforeEach(() => {
    service = {
      list: vi.fn().mockResolvedValue({ items: [exercise(true)], totalCount: 1 }),
      create: vi.fn().mockResolvedValue('7'),
      update: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
      setActive: vi.fn().mockResolvedValue(undefined),
    };
    notifications = { success: vi.fn(), error: vi.fn() };
  });

  it('should expose the page when the service answers', async () => {
    const store = createStore();

    await store.load({ first: 25, rows: 25 });

    expect(store.exercises()).toEqual([exercise(true)]);
    expect(store.totalCount()).toBe(1);
    expect(store.first()).toBe(25);
    expect(store.loading()).toBe(false);
  });

  it('should expose the error and drop the old rows when a reload fails', async () => {
    const store = createStore();
    await store.load();
    vi.mocked(service.list).mockRejectedValue(new NotFoundError('gone', 'Exercise.NotFound'));

    await store.applyFilter({ search: 'squat' });

    expect(store.loadError()).toContain('notFound');
    expect(store.exercises()).toEqual([]);
    expect(store.totalCount()).toBe(0);
    expect(store.loading()).toBe(false);
    expect(notifications.error).not.toHaveBeenCalled();
  });

  it('should clear the error when a retry succeeds', async () => {
    vi.mocked(service.list).mockRejectedValueOnce(new Error('offline'));
    const store = createStore();
    await store.load();

    await store.load();

    expect(store.loadError()).toBeNull();
    expect(store.exercises()).toEqual([exercise(true)]);
  });

  it('should go back to the first page when a filter is applied', async () => {
    const store = createStore();
    await store.load({ first: 50, rows: 25 });

    await store.applyFilter({ search: 'squat' });

    expect(service.list).toHaveBeenLastCalledWith({ search: 'squat' }, { first: 0, rows: 25 });
    expect(store.filter()).toEqual({ search: 'squat' });
  });

  it('should create a trimmed exercise when no id is given', async () => {
    const store = createStore();

    await expect(store.save(draft, null)).resolves.toBe(true);

    expect(service.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Squat' }));
    expect(service.update).not.toHaveBeenCalled();
    expect(service.list).toHaveBeenCalled();
  });

  it('should update the exercise when an id is given', async () => {
    const store = createStore();

    await store.save(draft, '7');

    expect(service.update).toHaveBeenCalledWith('7', expect.objectContaining({ name: 'Squat' }));
  });

  it('should not call the backend when the draft is invalid', async () => {
    const store = createStore();

    await expect(store.save({ ...draft, nameRu: ' ' }, null)).resolves.toBe(false);

    expect(service.create).not.toHaveBeenCalled();
    expect(notifications.error).toHaveBeenCalled();
    expect(store.saving()).toBe(false);
  });

  it('should delete the exercise and reload when removing', async () => {
    const store = createStore();

    await store.remove(exercise(true));

    expect(service.delete).toHaveBeenCalledWith('7');
    expect(service.list).toHaveBeenCalled();
  });

  it('should deactivate the exercise when it is active', async () => {
    const store = createStore();

    await store.toggleActivation(exercise(true));

    expect(service.setActive).toHaveBeenCalledWith('7', false);
  });
});
