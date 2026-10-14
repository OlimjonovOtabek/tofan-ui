import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { CoachExercisePickerStore } from './coach-exercise-picker.store';
import { LibraryExercise } from './services/coach-program-library.dto';
import { CoachProgramLibraryService } from './services/coach-program-library.service';

function exercise(id: string): LibraryExercise {
  return {
    id,
    name: 'Squat',
    nameRu: 'Приседание',
    nameUz: 'O‘tirib turish',
    muscleGroup: 1,
    equipmentType: 1,
    difficulty: 1,
    type: 1,
    gender: 0,
    isCompound: true,
    isHomeExercise: true,
    isActive: true,
    instructions: null,
    videoFileId: null,
  };
}

describe('CoachExercisePickerStore', () => {
  let library: Pick<CoachProgramLibraryService, 'listOwnExercises' | 'listExerciseCatalog'>;
  let notifications: Pick<NotificationService, 'error'>;

  beforeEach(() => {
    library = {
      listOwnExercises: vi.fn().mockResolvedValue([exercise('own')]),
      listExerciseCatalog: vi.fn().mockResolvedValue([exercise('catalog')]),
    };
    notifications = { error: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        CoachExercisePickerStore,
        { provide: CoachProgramLibraryService, useValue: library },
        { provide: NotificationService, useValue: notifications },
      ],
    });
  });

  it('should search the catalog with the trimmed text when the catalog is the source', async () => {
    const store = TestBed.inject(CoachExercisePickerStore);
    store.searchText.set(' squat ');

    await store.load();

    expect(library.listExerciseCatalog).toHaveBeenCalledWith('squat');
    expect(store.options().map((option) => option.id)).toEqual(['catalog']);
  });

  it('should load the coach exercises when the source changes to own', async () => {
    const store = TestBed.inject(CoachExercisePickerStore);

    await store.setSource('own');

    expect(store.options().map((option) => option.id)).toEqual(['own']);
  });

  it('should return to the catalog with an empty search when it is reset', async () => {
    const store = TestBed.inject(CoachExercisePickerStore);
    store.searchText.set('squat');
    await store.setSource('own');

    await store.reset();

    expect(store.source()).toBe('catalog');
    expect(library.listExerciseCatalog).toHaveBeenLastCalledWith('');
  });

  it('should show no options and report the error when the search fails', async () => {
    vi.mocked(library.listExerciseCatalog).mockRejectedValue(new ServiceUnavailableError());
    const store = TestBed.inject(CoachExercisePickerStore);

    await store.load();

    expect(store.options()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(notifications.error).toHaveBeenCalled();
  });
});
