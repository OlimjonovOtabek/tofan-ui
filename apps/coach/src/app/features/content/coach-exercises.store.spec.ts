import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { FileUploadService } from '@shared/components/file-upload/file-upload.service';
import { FileUploadTask, UploadCancelledError } from '@shared/components/file-upload/file-upload-request';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { CoachContentService } from './services/coach-content.service';
import { CoachExercise, CoachExerciseDraft } from './models/coach-exercise';
import { CoachExercisesService } from './services/coach-exercises.service';
import { CoachExercisesStore } from './coach-exercises.store';

const exercise: CoachExercise = {
  id: 'e1',
  name: 'Squat',
  nameUz: 'O‘tirib turish',
  nameRu: 'Приседание',
  muscleGroup: 'chest',
  equipmentType: 'bodyweight',
  difficulty: 'beginner',
  type: 'strength',
  gender: 'any',
  isCompound: true,
  isHomeExercise: true,
  isActive: true,
  instructions: null,
  videoFileId: null,
};

const request: CoachExerciseDraft = {
  name: 'Squat',
  nameUz: 'O‘tirib turish',
  nameRu: 'Приседание',
  muscleGroup: 'chest',
  equipmentType: 'bodyweight',
  difficulty: 'beginner',
  type: 'strength',
  gender: 'any',
  isCompound: true,
  isHomeExercise: true,
  instructions: null,
  videoFileId: null,
};

describe('CoachExercisesStore', () => {
  let content: Pick<CoachContentService, 'listExercises'>;
  let service: Pick<CoachExercisesService, 'create' | 'update'>;
  let uploads: Pick<FileUploadService, 'startUpload'>;
  let notifications: Pick<NotificationService, 'error'>;

  beforeEach(() => {
    content = { listExercises: vi.fn().mockResolvedValue([exercise]) };
    service = { create: vi.fn().mockResolvedValue('e1'), update: vi.fn().mockResolvedValue(undefined) };
    uploads = { startUpload: vi.fn().mockReturnValue(completedUpload('v1')) };
    notifications = { error: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        CoachExercisesStore,
        { provide: CoachContentService, useValue: content },
        { provide: CoachExercisesService, useValue: service },
        { provide: FileUploadService, useValue: uploads },
        { provide: NotificationService, useValue: notifications },
      ],
    });
  });

  it('should expose the coach-owned exercises returned by the backend', async () => {
    const store = TestBed.inject(CoachExercisesStore);

    await store.load();

    expect(store.items()).toEqual([exercise]);
    expect(content.listExercises).toHaveBeenCalledWith('');
  });

  it('should create an exercise and refresh the coach-owned list', async () => {
    const store = TestBed.inject(CoachExercisesStore);

    await expect(store.save(null, request)).resolves.toBe(true);

    expect(service.create).toHaveBeenCalledWith(request);
    expect(content.listExercises).toHaveBeenCalledTimes(1);
  });

  it('should update an owned exercise by id', async () => {
    const store = TestBed.inject(CoachExercisesStore);

    await expect(store.save('e1', request)).resolves.toBe(true);

    expect(service.update).toHaveBeenCalledWith('e1', request);
  });

  it('should upload video in the exercise video category and clear progress on completion', async () => {
    const store = TestBed.inject(CoachExercisesStore);

    await expect(store.uploadVideo(new File(['video'], 'demo.mp4'))).resolves.toBe('v1');

    const uploadRequest = vi.mocked(uploads.startUpload).mock.calls[0]?.[0];
    expect(uploadRequest?.file).toBeInstanceOf(File);
    expect(uploadRequest?.category).toBe('exerciseVideo');
    expect(store.uploadProgress()).toBeNull();
    expect(store.uploadFailed()).toBe(false);
  });

  it('should cancel the active video upload without showing it as a failed upload', async () => {
    let rejectUpload: (reason: unknown) => void = () => undefined;
    const cancel = vi.fn(() => rejectUpload(new UploadCancelledError()));
    vi.mocked(uploads.startUpload).mockReturnValue({
      result: new Promise<string>((_, reject) => {
        rejectUpload = reject;
      }),
      cancel,
    });
    const store = TestBed.inject(CoachExercisesStore);

    const pending = store.uploadVideo(new File(['video'], 'demo.mp4'));
    store.cancelVideoUpload();

    await expect(pending).resolves.toBeNull();
    expect(cancel).toHaveBeenCalledOnce();
    expect(store.uploadProgress()).toBeNull();
    expect(store.uploadFailed()).toBe(false);
  });

  it('should expose a search error while clearing stale exercises', async () => {
    vi.mocked(content.listExercises).mockRejectedValue(new ServiceUnavailableError());
    const store = TestBed.inject(CoachExercisesStore);

    await store.load();

    expect(store.items()).toEqual([]);
    expect(store.error()).toBe('errors.classes.network');
  });

  it('should send the trimmed search text and remember it as applied after loading', async () => {
    const store = TestBed.inject(CoachExercisesStore);
    store.searchText.set('  squat ');

    await store.load();

    expect(content.listExercises).toHaveBeenCalledWith('squat');
    expect(store.appliedSearch()).toBe('squat');
  });

  it('should keep the previous applied search when the search request fails', async () => {
    const store = TestBed.inject(CoachExercisesStore);
    store.searchText.set('squat');
    await store.load();
    vi.mocked(content.listExercises).mockRejectedValue(new ServiceUnavailableError());
    store.searchText.set('lunge');

    await store.load();

    expect(store.appliedSearch()).toBe('squat');
  });
});

function completedUpload(fileId: string): FileUploadTask {
  return { result: Promise.resolve(fileId), cancel: vi.fn() };
}
