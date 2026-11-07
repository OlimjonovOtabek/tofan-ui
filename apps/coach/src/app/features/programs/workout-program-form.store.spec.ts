import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { NotificationService } from '@core/feedback/notification.service';
import { VideoUploadsStore } from '@coach/core/videos/video-uploads.store';
import { DayVideoDraft, EMPTY_DAY_DRAFT, pendingVideoDraft } from './models/day-draft';
import { WorkoutProgramsService } from './services/workout-programs.service';
import { PROGRAM_QUEUED, WorkoutProgramFormStore } from './workout-program-form.store';

describe('WorkoutProgramFormStore', () => {
  const service = { create: vi.fn(), update: vi.fn(), get: vi.fn() };
  const notifications = { success: vi.fn(), error: vi.fn(), info: vi.fn() };
  const uploads = {
    uploads: signal<Record<string, unknown>>({}),
    saveWhenUploaded: vi.fn(),
    cancel: vi.fn(),
  };
  const pendingVideo: DayVideoDraft = { ...pendingVideoDraft('u1', 'blob:1'), localUrl: null };
  let store: WorkoutProgramFormStore;

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      providers: [
        WorkoutProgramFormStore,
        { provide: WorkoutProgramsService, useValue: service },
        { provide: NotificationService, useValue: notifications },
        { provide: VideoUploadsStore, useValue: uploads },
      ],
    });
    store = TestBed.inject(WorkoutProgramFormStore);
  });

  it('should not submit until the name and goal are set', async () => {
    await store.load(null);

    expect(await store.submit()).toBeNull();
    expect(service.create).not.toHaveBeenCalled();
  });

  it('should create the program with its days when submitted as new', async () => {
    await store.load(null);
    store.patch({ name: 'Strong', goal: 'gainMuscle' });
    store.saveDay(null, { ...EMPTY_DAY_DRAFT, title: 'Push' });
    service.create.mockResolvedValue('w9');

    expect(await store.submit()).toBe('w9');

    expect(service.create).toHaveBeenCalledWith(store.form(), store.days());
  });

  it('should update the loaded program without sending days', async () => {
    service.get.mockResolvedValue({
      name: 'Old',
      goal: 'maintain',
      experienceLevel: 'beginner',
      isHomeWorkout: true,
      isPublished: true,
    });
    await store.load('w1');
    service.update.mockResolvedValue(undefined);

    expect(await store.submit()).toBe('w1');

    expect(service.update).toHaveBeenCalledWith(
      'w1',
      expect.objectContaining({ name: 'Old', isHomeWorkout: true }),
    );
    expect(store.published()).toBe(true);
  });

  it('should keep the form and show the error when saving fails', async () => {
    await store.load(null);
    store.patch({ name: 'Strong', goal: 'maintain' });
    const failure = new Error('bad');
    service.create.mockRejectedValue(failure);

    expect(await store.submit()).toBeNull();

    expect(notifications.error).toHaveBeenCalledWith(failure);
    expect(store.form().name).toBe('Strong');
    expect(store.saving()).toBe(false);
  });

  it('should queue a new program when its videos are still uploading', async () => {
    uploads.uploads.set({ u1: { id: 'u1', status: { kind: 'sending', progress: 0.5 } } });
    await store.load(null);
    store.patch({ name: 'Strong', goal: 'maintain' });
    store.saveDay(null, { ...EMPTY_DAY_DRAFT, title: 'Push', videos: [pendingVideo] });

    expect(await store.submit()).toBe(PROGRAM_QUEUED);

    expect(service.create).not.toHaveBeenCalled();
    expect(uploads.saveWhenUploaded).toHaveBeenCalledWith(
      expect.objectContaining({ ids: ['u1'], group: 'new-program' }),
    );
    expect(notifications.info).toHaveBeenCalledWith('coachApp.createProgram.savedAfterUpload');
  });

  it('should not submit while an upload of a day is lost', async () => {
    uploads.uploads.set({});
    await store.load(null);
    store.patch({ name: 'Strong', goal: 'maintain' });
    store.saveDay(null, { ...EMPTY_DAY_DRAFT, title: 'Push', videos: [pendingVideo] });

    expect(store.lostUploads()).toBe(true);
    expect(await store.submit()).toBeNull();
  });

  it('should stop the uploads of removed days', () => {
    store.saveDay(null, { ...EMPTY_DAY_DRAFT, title: 'Push', videos: [pendingVideo] });

    store.removeDay(0);

    expect(uploads.cancel).toHaveBeenCalledWith('u1');
  });

  it('should edit and remove days in the draft list', async () => {
    store.saveDay(null, { ...EMPTY_DAY_DRAFT, title: 'A' });
    store.saveDay(null, { ...EMPTY_DAY_DRAFT, title: 'B' });
    store.saveDay(0, { ...EMPTY_DAY_DRAFT, title: 'A2' });
    store.removeDay(1);

    expect(store.days().map((day) => day.title)).toEqual(['A2']);
  });
});
