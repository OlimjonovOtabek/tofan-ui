import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import {
  FileUploadTask,
  UploadCancelledError,
} from '@shared/components/file-upload/file-upload-request';
import { FileUploadService } from '@shared/components/file-upload/file-upload.service';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { CoachProfile } from '@coach/core/profile/coach-profile.dto';
import { CoachProfileService } from '@coach/core/profile/coach-profile.service';
import { CoachProfileStore } from './coach-profile.store';

const profile: CoachProfile = {
  id: 't1',
  userId: 'u1',
  displayName: 'Coach One',
  bio: null,
  photoFileId: null,
  photoUrl: null,
  monthlyPrice: 450000,
  isPublished: true,
};

describe('CoachProfileStore', () => {
  let service: Pick<CoachProfileService, 'get' | 'update'>;
  let uploads: Pick<FileUploadService, 'startUpload'>;
  let notifications: Pick<NotificationService, 'success' | 'error'>;

  beforeEach(() => {
    service = { get: vi.fn().mockResolvedValue(profile), update: vi.fn().mockResolvedValue(undefined) };
    uploads = {
      startUpload: vi.fn().mockReturnValue({ result: Promise.resolve('f2'), cancel: vi.fn() }),
    };
    notifications = { success: vi.fn(), error: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        CoachProfileStore,
        { provide: CoachProfileService, useValue: service },
        { provide: FileUploadService, useValue: uploads },
        { provide: NotificationService, useValue: notifications },
      ],
    });
  });

  it('should expose the profile after a successful read', async () => {
    const store = TestBed.inject(CoachProfileStore);

    await store.load();

    expect(store.profile()).toEqual(profile);
    expect(store.loading()).toBe(false);
  });

  it('should save profile changes and reload the saved profile', async () => {
    const store = TestBed.inject(CoachProfileStore);

    await expect(
      store.save({ displayName: 'Coach Two', bio: null, photoFileId: null, monthlyPrice: 500000 }),
    ).resolves.toBe(true);

    expect(service.update).toHaveBeenCalledWith({
      displayName: 'Coach Two',
      bio: null,
      photoFileId: null,
      monthlyPrice: 500000,
    });
    expect(notifications.success).toHaveBeenCalledWith('coach.profile.saved');
    expect(service.get).toHaveBeenCalledTimes(1);
  });

  it('should expose a read error and clear an old profile when reload fails', async () => {
    vi.mocked(service.get).mockRejectedValue(new ServiceUnavailableError());
    const store = TestBed.inject(CoachProfileStore);

    await store.load();

    expect(store.profile()).toBeNull();
    expect(store.loadError()).toBe('errors.classes.network');
  });

  it('should return the stored file id when the avatar upload succeeds', async () => {
    const store = TestBed.inject(CoachProfileStore);

    const fileId = await store.uploadPhoto(new File(['x'], 'a.png'));

    expect(fileId).toBe('f2');
    expect(store.uploadProgress()).toBeNull();
  });

  it('should stop the running upload without an error toast when it is cancelled', async () => {
    let rejectResult: (reason: unknown) => void = () => undefined;
    const task: FileUploadTask = {
      result: new Promise<string>((_, reject) => (rejectResult = reject)),
      cancel: vi.fn(() => rejectResult(new UploadCancelledError())),
    };
    vi.mocked(uploads.startUpload).mockReturnValue(task);
    const store = TestBed.inject(CoachProfileStore);

    const pending = store.uploadPhoto(new File(['x'], 'a.png'));
    store.cancelPhotoUpload();

    await expect(pending).resolves.toBeNull();
    expect(task.cancel).toHaveBeenCalledTimes(1);
    expect(notifications.error).not.toHaveBeenCalled();
    expect(store.uploadProgress()).toBeNull();
  });

  it('should report the failure when the avatar upload fails', async () => {
    const failure = new ServiceUnavailableError();
    vi.mocked(uploads.startUpload).mockReturnValue({
      result: Promise.reject(failure),
      cancel: vi.fn(),
    });
    const store = TestBed.inject(CoachProfileStore);

    await expect(store.uploadPhoto(new File(['x'], 'a.png'))).resolves.toBeNull();

    expect(notifications.error).toHaveBeenCalledWith(failure);
  });
});
