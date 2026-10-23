import { TestBed } from '@angular/core/testing';
import { ClientsService } from '@coach/core/clients/clients.service';
import { CoachProfileService } from '@coach/core/profile/coach-profile.service';
import { VideoStatusService } from '@coach/core/videos/video-status.service';
import { NotificationService } from '@core/feedback/notification.service';
import { FileUploadService } from '@shared/components/file-upload/file-upload.service';
import { EarningsStore } from './earnings.store';
import { PreviewVideosStore } from './preview-videos.store';
import { ProfileEditStore } from './profile-edit.store';
import { ProfileStore } from './profile.store';
import { ProfileService } from './services/profile.service';

const profile = {
  id: 'p',
  displayName: 'Aziz',
  bio: null,
  photoFileId: null,
  monthlyPrice: 1000,
  slug: 'aziz',
  isPublished: true,
  photoUrl: null,
  userId: 'u',
};

describe('profile stores', () => {
  const profiles = { get: vi.fn(), update: vi.fn() };
  const clients = { list: vi.fn() };
  const stats = {
    publishedProgramCounts: vi.fn(),
    summary: vi.fn(),
    payments: vi.fn(),
    previewVideos: vi.fn(),
    addPreviewVideo: vi.fn(),
    renamePreviewVideo: vi.fn(),
    deletePreviewVideo: vi.fn(),
    reorderPreviewVideos: vi.fn(),
  };
  const uploads = { upload: vi.fn() };
  const statuses = { read: vi.fn() };
  const notifications = { success: vi.fn(), error: vi.fn(), failure: vi.fn() };

  beforeEach(() => {
    vi.resetAllMocks();
    statuses.read.mockResolvedValue([]);
    TestBed.configureTestingModule({
      providers: [
        ProfileStore,
        ProfileEditStore,
        EarningsStore,
        PreviewVideosStore,
        { provide: CoachProfileService, useValue: profiles },
        { provide: ClientsService, useValue: clients },
        { provide: ProfileService, useValue: stats },
        { provide: FileUploadService, useValue: uploads },
        { provide: VideoStatusService, useValue: statuses },
        { provide: NotificationService, useValue: notifications },
      ],
    });
  });

  it('should build the overview even when the extra numbers fail', async () => {
    profiles.get.mockResolvedValue(profile);
    clients.list.mockRejectedValue(new Error('x'));
    stats.publishedProgramCounts.mockResolvedValue({ workout: 1, meal: 2 });
    const store = TestBed.inject(ProfileStore);

    await store.load();

    expect(store.overview()).toMatchObject({
      clientCount: null,
      publishedWorkoutPrograms: 1,
      publishedMealPrograms: 2,
    });
  });

  it('should upload the avatar, save the profile and reload', async () => {
    profiles.get.mockResolvedValue(profile);
    clients.list.mockResolvedValue([]);
    stats.publishedProgramCounts.mockResolvedValue({ workout: 0, meal: 0 });
    uploads.upload.mockResolvedValue('file-9');
    const store = TestBed.inject(ProfileStore);
    await store.load();

    await store.changePhoto(new File(['x'], 'a.png'));

    expect(profiles.update).toHaveBeenCalledWith(
      expect.objectContaining({ photoFileId: 'file-9', displayName: 'Aziz' }),
    );
    expect(notifications.success).toHaveBeenCalledWith('coachApp.profile.photoSaved');
    expect(store.uploadingPhoto()).toBe(false);
  });

  it('should save a profile change and keep the old values for the rest', async () => {
    profiles.get.mockResolvedValue(profile);
    const store = TestBed.inject(ProfileEditStore);
    await store.load();

    expect(await store.save({ monthlyPrice: 2000 }, 'coachApp.pricing.saved')).toBe(true);

    expect(profiles.update).toHaveBeenCalledWith({
      displayName: 'Aziz',
      bio: null,
      photoFileId: null,
      monthlyPrice: 2000,
    });
  });

  it('should ignore a late earnings answer when another period was chosen', async () => {
    const store = TestBed.inject(EarningsStore);
    let late: (value: unknown) => void = () => undefined;
    stats.summary.mockReturnValueOnce(new Promise((resolve) => (late = resolve)));
    stats.payments.mockResolvedValue({ payments: [], totalCount: 0 });
    const first = store.load('thisMonth');
    stats.summary.mockResolvedValueOnce({ netAmount: 5 });

    await store.load('thisYear');
    late({ netAmount: 1 });
    await first;

    expect(store.earnings()?.summary).toEqual({ netAmount: 5 });
  });

  it('should append the next page of payments', async () => {
    const store = TestBed.inject(EarningsStore);
    stats.summary.mockResolvedValue({});
    stats.payments.mockResolvedValueOnce({ payments: [{ id: 'a' }], totalCount: 2 });
    await store.load('thisMonth');
    stats.payments.mockResolvedValueOnce({ payments: [{ id: 'b' }], totalCount: 2 });

    await store.loadMore();

    expect(store.earnings()?.payments.map((payment) => payment.id)).toEqual(['a', 'b']);
    expect(store.canLoadMore()).toBe(false);
  });

  it('should add a preview video after the upload and block a sixth one', async () => {
    stats.previewVideos.mockResolvedValue([]);
    uploads.upload.mockResolvedValue('f1');
    stats.addPreviewVideo.mockResolvedValue('v1');
    const store = TestBed.inject(PreviewVideosStore);
    await store.load();

    await store.add(new File(['x'], 'a.mp4'));

    expect(stats.addPreviewVideo).toHaveBeenCalledWith('f1');
    stats.previewVideos.mockResolvedValue(new Array(5).fill({ id: 'x', fileId: 'f' }));
    await store.load();
    uploads.upload.mockClear();
    await store.add(new File(['x'], 'b.mp4'));
    expect(uploads.upload).not.toHaveBeenCalled();
  });

  it('should restore the order when saving the new order fails', async () => {
    stats.previewVideos.mockResolvedValue([
      { id: 'a', fileId: 'fa' },
      { id: 'b', fileId: 'fb' },
    ]);
    const store = TestBed.inject(PreviewVideosStore);
    await store.load();
    stats.reorderPreviewVideos.mockRejectedValue(new Error('x'));

    await store.reorder(0, 1);

    expect(store.videos()?.map((video) => video.id)).toEqual(['a', 'b']);
    expect(notifications.error).toHaveBeenCalled();
  });
});
