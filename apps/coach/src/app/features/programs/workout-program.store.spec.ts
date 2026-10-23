import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { EMPTY_DAY_DRAFT } from './models/day-draft';
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
  const notifications = { success: vi.fn(), error: vi.fn() };
  let store: WorkoutProgramStore;

  beforeEach(async () => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      providers: [
        WorkoutProgramStore,
        { provide: WorkoutProgramsService, useValue: service },
        { provide: NotificationService, useValue: notifications },
      ],
    });
    store = TestBed.inject(WorkoutProgramStore);
    service.get.mockResolvedValue(program);
    await store.load('w1');
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
