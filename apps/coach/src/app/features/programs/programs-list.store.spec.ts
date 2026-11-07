import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { VideoUploadSaveResult } from '@coach/core/videos/video-upload';
import { VideoUploadsStore } from '@coach/core/videos/video-uploads.store';
import { Subject } from 'rxjs';
import { ProgramsListStore } from './programs-list.store';
import { MealProgramsService } from './services/meal-programs.service';
import { WorkoutProgramsService } from './services/workout-programs.service';

const program = (id: string, isPublished: boolean) => ({
  id,
  name: id,
  goal: null,
  experienceLevel: null,
  isHomeWorkout: false,
  isPublished,
  dayCount: 1,
});

describe('ProgramsListStore', () => {
  const workouts = { list: vi.fn(), publish: vi.fn() };
  const meals = { list: vi.fn(), publish: vi.fn() };
  const notifications = { success: vi.fn(), error: vi.fn() };
  const saves = new Subject<VideoUploadSaveResult>();
  let store: ProgramsListStore;

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      providers: [
        ProgramsListStore,
        { provide: WorkoutProgramsService, useValue: workouts },
        { provide: MealProgramsService, useValue: meals },
        { provide: NotificationService, useValue: notifications },
        { provide: VideoUploadsStore, useValue: { saves$: saves } },
      ],
    });
    store = TestBed.inject(ProgramsListStore);
  });

  it('should list published workout programs first', async () => {
    workouts.list.mockResolvedValue([program('a', false), program('b', true)]);

    await store.load('workout');

    expect(store.workouts()?.map((item) => item.id)).toEqual(['b', 'a']);
  });

  it('should keep the error when the meal programs fail to load', async () => {
    meals.list.mockRejectedValue(new Error('down'));

    await store.load('meal');

    expect(store.meals()).toBeNull();
    expect(store.mealsError()).not.toBeNull();
  });

  it('should publish, confirm and reload the list', async () => {
    workouts.publish.mockResolvedValue(undefined);
    workouts.list.mockResolvedValue([program('a', true)]);

    await store.publish('workout', 'a');

    expect(workouts.publish).toHaveBeenCalledWith('a');
    expect(notifications.success).toHaveBeenCalledWith('coachApp.programs.publishSuccess');
    expect(store.workouts()?.[0].isPublished).toBe(true);
    expect(store.publishingId()).toBeNull();
  });

  it('should show the error when publishing fails', async () => {
    const failure = new Error('nope');
    meals.publish.mockRejectedValue(failure);

    await store.publish('meal', 'm');

    expect(notifications.error).toHaveBeenCalledWith(failure);
    expect(meals.list).not.toHaveBeenCalled();
  });

  it('should read the workouts again when a queued program was created', async () => {
    workouts.list.mockResolvedValue([program('a', false)]);

    saves.next({ group: 'new-program', tag: null, failure: null, succeeded: true });

    await vi.waitFor(() => expect(store.workouts()?.map((item) => item.id)).toEqual(['a']));
  });
});
