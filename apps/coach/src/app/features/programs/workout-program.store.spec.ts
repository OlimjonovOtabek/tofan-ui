import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { VideoUploadSaveResult } from '@coach/core/videos/video-upload';
import { VideoUploadsStore } from '@coach/core/videos/video-uploads.store';
import { Subject } from 'rxjs';
import { EMPTY_DAY_DRAFT, pendingVideoDraft } from './models/day-draft';
import { WorkoutDay, WorkoutProgramDetail } from './models/workout-program';
import { WorkoutProgramsService } from './services/workout-programs.service';
import { WorkoutProgramStore } from './workout-program.store';

const day = (id: string): WorkoutDay => ({
  id,
  title: id,
  description: '',
  isRestDay: false,
  videos: [],
  droppedExerciseCount: 0,
});

const program: WorkoutProgramDetail = {
  id: 'w1',
  name: 'Strong',
  goal: 'gainMuscle',
  experienceLevel: 'beginner',
  isHomeWorkout: false,
  isPublished: false,
  dayCount: 3,
  days: [day('a'), day('b'), day('c')],
};

describe('WorkoutProgramStore', () => {
  const service = {
    get: vi.fn(),
    publish: vi.fn(),
    unpublish: vi.fn(),
    delete: vi.fn(),
    addDay: vi.fn(),
    updateDay: vi.fn(),
    deleteDay: vi.fn(),
    reorderDays: vi.fn(),
  };
  const notifications = { success: vi.fn(), error: vi.fn(), info: vi.fn() };
  const saves = new Subject<VideoUploadSaveResult>();
  const uploads = { saves$: saves, saveWhenUploaded: vi.fn() };
  let store: WorkoutProgramStore;

  beforeEach(async () => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      providers: [
        WorkoutProgramStore,
        { provide: WorkoutProgramsService, useValue: service },
        { provide: NotificationService, useValue: notifications },
        { provide: VideoUploadsStore, useValue: uploads },
      ],
    });
    store = TestBed.inject(WorkoutProgramStore);
    service.get.mockResolvedValue(program);
    await store.load('w1');
  });

  it('should queue a day and add it after its videos are stored', async () => {
    const draft = { ...EMPTY_DAY_DRAFT, title: 'Push', videos: [pendingVideoDraft('u1', 'x')] };

    expect(await store.addDay(draft)).toBe(true);

    expect(service.addDay).not.toHaveBeenCalled();
    const queued = uploads.saveWhenUploaded.mock.calls[0][0] as {
      save(ids: Record<string, string>): Promise<unknown>;
      ids: string[];
      tag: string;
    };
    expect(queued.ids).toEqual(['u1']);
    expect(queued.tag).toBe('w1');
    await queued.save({ u1: 'f1' });
    expect(service.addDay).toHaveBeenCalledWith('w1', draft, { u1: 'f1' });
  });

  it('should reload the program when its queued day was saved', async () => {
    service.get.mockClear();

    saves.next({ group: 'workout-day', tag: 'w1', failure: null, succeeded: true });

    await vi.waitFor(() => expect(service.get).toHaveBeenCalledWith('w1'));
  });

  it('should publish a draft and reload it', async () => {
    service.get.mockResolvedValue({ ...program, isPublished: true });

    expect(await store.togglePublished()).toBe(true);

    expect(service.publish).toHaveBeenCalledWith('w1');
    expect(notifications.success).toHaveBeenCalledWith('coachApp.programs.publishSuccess');
    expect(store.program()?.isPublished).toBe(true);
  });

  it('should unpublish a published program', async () => {
    service.get.mockResolvedValue({ ...program, isPublished: true });
    await store.load('w1');

    await store.togglePublished();

    expect(service.unpublish).toHaveBeenCalledWith('w1');
    expect(notifications.success).toHaveBeenCalledWith('coachApp.workoutProgram.unpublished');
  });

  it('should send the new day order when a day moves down', async () => {
    await store.moveDay(0, 1);

    expect(service.reorderDays).toHaveBeenCalledWith('w1', ['b', 'a', 'c']);
  });

  it('should not move a day past the ends of the list', async () => {
    expect(await store.moveDay(2, 1)).toBe(false);
    expect(service.reorderDays).not.toHaveBeenCalled();
  });

  it('should report the failure and stay idle when adding a day fails', async () => {
    const failure = new Error('bad');
    service.addDay.mockRejectedValue(failure);

    expect(await store.addDay(EMPTY_DAY_DRAFT)).toBe(false);

    expect(notifications.error).toHaveBeenCalledWith(failure);
    expect(store.busy()).toBeNull();
  });

  it('should not reload after the program is deleted', async () => {
    service.get.mockClear();

    expect(await store.delete()).toBe(true);

    expect(service.get).not.toHaveBeenCalled();
    expect(notifications.success).toHaveBeenCalledWith('coachApp.workoutProgram.deleted');
  });
});
