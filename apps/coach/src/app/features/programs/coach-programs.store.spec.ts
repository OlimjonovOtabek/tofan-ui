import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { CoachProgramsService } from './services/coach-programs.service';
import { WorkoutProgram } from './models/coach-program';
import { CoachProgramsStore } from './coach-programs.store';
import { CoachProfileService } from '@coach/core/profile/coach-profile.service';

describe('CoachProgramsStore', () => {
  let service: Pick<
    CoachProgramsService,
    'listWorkoutPrograms' | 'listMealPrograms' | 'createWorkout' | 'createMeal' | 'publishWorkout' | 'publishMeal'
  >;
  const notifications: Pick<NotificationService, 'success' | 'error'> = {
    success: vi.fn(),
    error: vi.fn(),
  };
  let profile: Pick<CoachProfileService, 'get'>;

  beforeEach(() => {
    profile = { get: vi.fn().mockResolvedValue({
      id: 'p1', userId: 'u1', displayName: 'Coach', bio: null,
      photoFileId: null, photoUrl: null, monthlyPrice: 350000, isPublished: true,
    }) };
    service = {
      listWorkoutPrograms: vi.fn().mockResolvedValue([
        {
          id: 'w1',
          name: 'Strength',
          goal: 'loseWeight',
          experienceLevel: 'beginner',
          isHomeWorkout: false,
          isPublished: true,
          dayCount: 3,
          createdOnUtc: '2026-10-01T00:00:00Z',
        },
      ]),
      listMealPrograms: vi.fn().mockResolvedValue([]),
      createWorkout: vi.fn().mockResolvedValue('w2'),
      createMeal: vi.fn().mockResolvedValue('m2'),
      publishWorkout: vi.fn().mockResolvedValue(undefined),
      publishMeal: vi.fn().mockResolvedValue(undefined),
    };
    TestBed.configureTestingModule({
      providers: [
        CoachProgramsStore,
        { provide: CoachProgramsService, useValue: service },
        { provide: NotificationService, useValue: notifications },
        { provide: CoachProfileService, useValue: profile },
      ],
    });
  });

  it('should report loaded only after the first load settles', async () => {
    const store = TestBed.inject(CoachProgramsStore);
    expect(store.loaded()).toBe(false);

    const loading = store.load();
    expect(store.loaded()).toBe(false);
    await loading;

    expect(store.loaded()).toBe(true);
  });

  it('should expose published programs and profile readiness when the workspace loads', async () => {
    const store = TestBed.inject(CoachProgramsStore);

    await store.load();

    expect(store.publishedWorkout()?.id).toBe('w1');
    expect(store.publishedMeal()).toBeNull();
    expect(store.profileReady()).toBe(true);
  });

  it('should expose both program lists when both requests succeed', async () => {
    const store = TestBed.inject(CoachProgramsStore);

    await store.load();

    expect(store.workouts().map((program) => program.name)).toEqual(['Strength']);
    expect(store.meals()).toEqual([]);
    expect(store.loading()).toBe(false);
  });

  it('should preserve one program list when the other request fails', async () => {
    vi.mocked(service.listMealPrograms).mockRejectedValue(new ServiceUnavailableError());
    const store = TestBed.inject(CoachProgramsStore);

    await store.load();

    expect(store.workouts()).toHaveLength(1);
    expect(store.meals()).toEqual([]);
    expect(store.mealError()).toBe('errors.classes.network');
  });

  it('should create a workout draft, report success and refresh program summaries', async () => {
    const store = TestBed.inject(CoachProgramsStore);

    await expect(
      store.createWorkout({ name: 'Strength', goal: 'gainMuscle', experienceLevel: 'beginner', isHomeWorkout: true }),
    ).resolves.toBe('w2');

    expect(service.createWorkout).toHaveBeenCalledWith({
      name: 'Strength',
      goal: 'gainMuscle',
      experienceLevel: 'beginner',
      isHomeWorkout: true,
    });
    expect(service.listWorkoutPrograms).toHaveBeenCalledTimes(1);
  });

  it('should publish a meal program and refresh both summaries', async () => {
    const store = TestBed.inject(CoachProgramsStore);
    const program = {
      id: 'm1',
      startDate: '2026-10-01',
      endDate: '2026-10-07',
      isPublished: false,
      mealCount: 4,
      createdOnUtc: '2026-10-01T00:00:00Z',
    };

    await expect(store.publishMeal(program)).resolves.toBe(true);

    expect(service.publishMeal).toHaveBeenCalledWith('m1');
    expect(service.listMealPrograms).toHaveBeenCalledTimes(1);
  });

  const draftWorkout: WorkoutProgram = {
    id: 'w2',
    name: 'Hypertrophy',
    goal: 'loseWeight',
    experienceLevel: 'beginner',
    isHomeWorkout: false,
    isPublished: false,
    dayCount: 0,
    createdOnUtc: '2026-10-02T00:00:00Z',
  };

  it('should keep the old published program and report the failure when publishing is refused', async () => {
    const refusal = new ServiceUnavailableError();
    vi.mocked(service.publishWorkout).mockRejectedValue(refusal);
    const store = TestBed.inject(CoachProgramsStore);
    await store.load();

    await expect(store.publishWorkout(draftWorkout)).resolves.toBe(false);

    expect(notifications.error).toHaveBeenCalledWith(refusal);
    expect(store.publishedWorkout()?.id).toBe('w1');
    expect(store.publishing()).toBe(false);
    expect(service.listWorkoutPrograms).toHaveBeenCalledTimes(1);
  });

  it('should not send a second publish request while one is running', async () => {
    let release: () => void = () => undefined;
    vi.mocked(service.publishWorkout).mockReturnValue(new Promise<void>((resolve) => (release = resolve)));
    const store = TestBed.inject(CoachProgramsStore);

    const first = store.publishWorkout(draftWorkout);
    await expect(store.publishWorkout(draftWorkout)).resolves.toBe(false);
    release();
    await first;

    expect(service.publishWorkout).toHaveBeenCalledTimes(1);
  });

  it('should report success and offer a refresh when the list reload fails after publishing', async () => {
    const store = TestBed.inject(CoachProgramsStore);
    vi.mocked(service.listWorkoutPrograms).mockRejectedValue(new ServiceUnavailableError());

    await expect(store.publishWorkout(draftWorkout)).resolves.toBe(true);

    expect(store.publishRefreshFailed()).toBe(true);
    vi.mocked(service.listWorkoutPrograms).mockResolvedValue([{ ...draftWorkout, isPublished: true }]);
    await store.refresh();

    expect(store.publishRefreshFailed()).toBe(false);
    expect(store.publishedWorkout()?.id).toBe('w2');
    expect(service.publishWorkout).toHaveBeenCalledTimes(1);
  });

  it('should leave the published meal program unchanged when a workout is published', async () => {
    vi.mocked(service.listMealPrograms).mockResolvedValue([
      { id: 'm1', startDate: '2026-10-01', endDate: '2026-10-07', isPublished: true, mealCount: 2, createdOnUtc: '2026-10-01T00:00:00Z' },
    ]);
    const store = TestBed.inject(CoachProgramsStore);

    await store.publishWorkout(draftWorkout);

    expect(service.publishMeal).not.toHaveBeenCalled();
    expect(store.publishedMeal()?.id).toBe('m1');
  });
});
