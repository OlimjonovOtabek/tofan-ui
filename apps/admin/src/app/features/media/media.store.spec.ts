import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { ConflictError } from '@shared/models/errors/conflict.error';
import { NotFoundError } from '@shared/models/errors/not-found.error';
import { FileUploadService } from '@shared/components/file-upload/file-upload.service';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { MediaStore } from './media.store';
import { StoredFile } from './models/stored-file';
import { ExerciseVideosService } from './services/exercise-videos.service';
import { MediaService } from './services/media.service';

describe('MediaStore', () => {
  const video = new StoredFile(
    'video',
    'exerciseVideo',
    'squat.mp4',
    'video/mp4',
    10,
    new Date(),
    null,
  );

  let service: Pick<MediaService, 'list' | 'delete'>;
  let notifications: Pick<NotificationService, 'success' | 'error'>;
  let fileUploadService: Pick<FileUploadService, 'upload'>;
  let exerciseVideos: Pick<ExerciseVideosService, 'listWithoutVideo' | 'attachVideo'>;

  function createStore(): MediaStore {
    TestBed.configureTestingModule({
      providers: [
        MediaStore,
        { provide: MediaService, useValue: service },
        { provide: NotificationService, useValue: notifications },
        { provide: FileUploadService, useValue: fileUploadService },
        { provide: ExerciseVideosService, useValue: exerciseVideos },
      ],
    });
    return TestBed.inject(MediaStore);
  }

  beforeEach(() => {
    service = {
      list: vi.fn().mockResolvedValue({ items: [video], totalCount: 1 }),
      delete: vi.fn().mockResolvedValue(undefined),
    };
    notifications = { success: vi.fn(), error: vi.fn() };
    fileUploadService = { upload: vi.fn().mockResolvedValue('new-file') };
    exerciseVideos = {
      listWithoutVideo: vi
        .fn()
        .mockResolvedValue([
          { id: 'e1', names: { en: 'Squat', uz: 'Skvat', ru: 'Присед' }, isActive: true },
        ]),
      attachVideo: vi.fn().mockResolvedValue(undefined),
    };
  });

  it('should expose the error and drop the old rows when a reload fails', async () => {
    const store = createStore();
    await store.load();
    vi.mocked(service.list).mockRejectedValue(new Error('offline'));

    await store.load();

    expect(store.loadError()).not.toBeNull();
    expect(store.files()).toEqual([]);
    expect(store.loading()).toBe(false);
  });

  it('should keep the list and show the reason when the file is still in use', async () => {
    const store = createStore();
    await store.load();
    const inUse = new ConflictError('in use', 'StoredFile.InUse');
    vi.mocked(service.delete).mockRejectedValue(inUse);

    await store.remove(video);

    expect(notifications.error).toHaveBeenCalledWith(inUse);
    expect(service.list).toHaveBeenCalledTimes(1);
    expect(store.deletingId()).toBeNull();
  });

  it('should refresh the list when the file was already deleted', async () => {
    const store = createStore();
    await store.load();
    vi.mocked(service.delete).mockRejectedValue(new NotFoundError('gone', 'StoredFile.NotFound'));

    await store.remove(video);

    expect(service.list).toHaveBeenCalledTimes(2);
  });

  it('should upload the file and show the newest page when the upload succeeds', async () => {
    const store = createStore();
    await store.load({ first: 50, rows: 25, sortField: 'createdOnUtc', sortDirection: 'desc' });
    const file = new File(['video'], 'squat.mp4');

    const uploaded = await store.upload({
      file,
      category: 'exerciseVideo',
      exerciseId: 'e1',
      caption: ' Skvat ',
    });

    expect(uploaded).toBe(true);
    expect(fileUploadService.upload).toHaveBeenCalledWith(
      expect.objectContaining({ file, category: 'exerciseVideo', caption: 'Skvat' }),
    );
    expect(exerciseVideos.attachVideo).toHaveBeenCalledWith('e1', 'new-file');
    expect(service.list).toHaveBeenLastCalledWith({
      first: 0,
      rows: 25,
      sortField: 'createdOnUtc',
      sortDirection: 'desc',
    });
    expect(store.uploading()).toBe(false);
  });

  it('should keep the dialog open and report the failure when the upload fails', async () => {
    const store = createStore();
    const failure = new ServiceUnavailableError();
    vi.mocked(fileUploadService.upload).mockRejectedValue(failure);

    const uploaded = await store.upload({
      file: new File(['x'], 'a.pdf'),
      category: 'document',
      exerciseId: null,
      caption: '',
    });

    expect(uploaded).toBe(false);
    expect(notifications.error).toHaveBeenCalledWith(failure);
  });

  it('should not call the backend when no file was chosen', async () => {
    const store = createStore();

    const uploaded = await store.upload({
      file: null,
      category: 'document',
      exerciseId: null,
      caption: '',
    });

    expect(uploaded).toBe(false);
    expect(fileUploadService.upload).not.toHaveBeenCalled();
  });

  it('should delete the uploaded file when it cannot be attached to the exercise', async () => {
    const store = createStore();
    const taken = new ConflictError('taken', 'Exercise.VideoAlreadyAttached');
    vi.mocked(exerciseVideos.attachVideo).mockRejectedValue(taken);

    const uploaded = await store.upload({
      file: new File(['v'], 'squat.mp4'),
      category: 'exerciseVideo',
      exerciseId: 'e1',
      caption: '',
    });

    expect(uploaded).toBe(false);
    expect(service.delete).toHaveBeenCalledWith('new-file');
    expect(notifications.error).toHaveBeenCalledWith(taken);
  });

  it('should list only the exercises without a video when the dialog asks for them', async () => {
    const store = createStore();

    await store.loadExerciseChoices();

    expect(store.exerciseChoices()).toEqual([
      { id: 'e1', names: { en: 'Squat', uz: 'Skvat', ru: 'Присед' }, isActive: true },
    ]);
    expect(store.exerciseChoicesLoading()).toBe(false);
  });

  it('should expose the error when the exercises cannot be read', async () => {
    vi.mocked(exerciseVideos.listWithoutVideo).mockRejectedValue(new ServiceUnavailableError());
    const store = createStore();

    await store.loadExerciseChoices();

    expect(store.exerciseChoicesError()).not.toBeNull();
    expect(store.exerciseChoices()).toEqual([]);
  });
});
