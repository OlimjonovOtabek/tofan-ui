import { TestBed } from '@angular/core/testing';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { NotificationService } from '@core/feedback/notification.service';
import { LibraryExercise } from './services/coach-program-library.dto';
import { CoachWorkoutEditorService } from './services/coach-workout-editor.service';
import { CoachWorkoutEditorStore } from './coach-workout-editor.store';

const plan = {
  id: 'w1',
  userId: 'u1',
  name: 'Strength',
  goal: 'gainMuscle',
  experienceLevel: 'beginner',
  source: 2,
  isHomeWorkout: false,
  startDate: '2026-10-01T00:00:00Z',
  endDate: null,
  isActive: false,
  isCustomized: false,
  createdOnUtc: '2026-10-01T00:00:00Z',
};

const exercise: LibraryExercise = {
  id: 'e1',
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

describe('CoachWorkoutEditorStore', () => {
  let service: Pick<
    CoachWorkoutEditorService,
    'getPlan' | 'getProgramPublished' | 'listAllDays' | 'createDay' | 'updateDay' | 'deleteDay'
  >;
  let notifications: Pick<NotificationService, 'success' | 'error'>;

  beforeEach(() => {
    service = {
      getPlan: vi.fn().mockResolvedValue(plan),
      getProgramPublished: vi.fn().mockResolvedValue(false),
      listAllDays: vi.fn().mockResolvedValue([]),
      createDay: vi.fn().mockResolvedValue('d1'),
      updateDay: vi.fn().mockResolvedValue(undefined),
      deleteDay: vi.fn().mockResolvedValue(undefined),
    };
    notifications = { success: vi.fn(), error: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        CoachWorkoutEditorStore,
        { provide: CoachWorkoutEditorService, useValue: service },
        { provide: NotificationService, useValue: notifications },
      ],
    });
  });

  it('should expose the selected workout program and its own days', async () => {
    const store = TestBed.inject(CoachWorkoutEditorStore);

    await store.load('w1');

    expect(store.plan()).toEqual(plan);
    expect(store.days()).toEqual([]);
    expect(store.isPublished()).toBe(false);
  });

  it('should create a draft day only when explicit save is requested', async () => {
    const store = TestBed.inject(CoachWorkoutEditorStore);
    await store.load('w1');
    store.addDay('Monday', 'monday', 'fullBody', false);

    expect(service.createDay).not.toHaveBeenCalled();
    await expect(store.save()).resolves.toBe(true);

    expect(service.createDay).toHaveBeenCalledWith({
      workoutPlanId: 'w1',
      dayOfWeek: 1,
      splitType: 1,
      title: 'Monday',
      isRestDay: false,
      displayOrder: 0,
      exercises: [],
    });
    expect(store.dirty()).toBe(false);
  });

  it('should add a selected exercise to a day draft without saving immediately', async () => {
    const store = TestBed.inject(CoachWorkoutEditorStore);
    await store.load('w1');
    store.addDay('Monday', 'monday', 'fullBody', false);
    const day = store.days()[0];
    store.addExercise(day.key, exercise);

    expect(store.days()[0].exercises[0]).toMatchObject({
      exerciseId: 'e1',
      targetSets: 3,
      targetReps: '8-12',
      restSeconds: 60,
    });
    expect(service.createDay).not.toHaveBeenCalled();
  });

  it('should mark saved and failed days separately when one day write fails', async () => {
    const failure = new ServiceUnavailableError();
    vi.mocked(service.createDay).mockResolvedValueOnce('d1').mockRejectedValueOnce(failure);
    const store = TestBed.inject(CoachWorkoutEditorStore);
    await store.load('w1');
    store.addDay('Monday', 'monday', 'fullBody', false);
    store.addDay('Tuesday', 'tuesday', 'fullBody', false);
    const [monday, tuesday] = store.days();

    await expect(store.save()).resolves.toBe(false);

    expect(store.saveStates().get(monday.key)).toBe('saved');
    expect(store.saveStates().get(tuesday.key)).toBe('failed');
    expect(notifications.error).toHaveBeenCalledWith(failure);
    expect(store.days()[1].title).toBe('Tuesday');
    expect(store.dirty()).toBe(true);
  });

  it('should resend only the failed day when saving again after a partial failure', async () => {
    vi.mocked(service.createDay)
      .mockResolvedValueOnce('d1')
      .mockRejectedValueOnce(new ServiceUnavailableError())
      .mockResolvedValueOnce('d2');
    const store = TestBed.inject(CoachWorkoutEditorStore);
    await store.load('w1');
    store.addDay('Monday', 'monday', 'fullBody', false);
    store.addDay('Tuesday', 'tuesday', 'fullBody', false);
    await store.save();

    await expect(store.save()).resolves.toBe(true);

    expect(service.createDay).toHaveBeenCalledTimes(3);
    expect(service.updateDay).not.toHaveBeenCalled();
    expect(service.createDay).toHaveBeenLastCalledWith(expect.objectContaining({ title: 'Tuesday' }));
  });

  it('should clear the failed mark when the failed day is edited again', async () => {
    vi.mocked(service.createDay).mockRejectedValueOnce(new ServiceUnavailableError());
    const store = TestBed.inject(CoachWorkoutEditorStore);
    await store.load('w1');
    store.addDay('Monday', 'monday', 'fullBody', false);
    const day = store.days()[0];
    await store.save();

    store.updateDay(day.key, { title: 'Mon' });

    expect(store.saveStates().has(day.key)).toBe(false);
  });

  it('should ignore a second save while one is already running', async () => {
    let release: (id: string) => void = () => undefined;
    vi.mocked(service.createDay).mockReturnValue(new Promise<string>((resolve) => (release = resolve)));
    const store = TestBed.inject(CoachWorkoutEditorStore);
    await store.load('w1');
    store.addDay('Monday', 'monday', 'fullBody', false);

    const first = store.save();
    await expect(store.save()).resolves.toBe(false);
    release('d1');
    await first;

    expect(service.createDay).toHaveBeenCalledTimes(1);
  });

  it('should refuse to save a day without a title', async () => {
    const store = TestBed.inject(CoachWorkoutEditorStore);
    await store.load('w1');
    store.addDay('   ', 'monday', 'fullBody', false);

    await expect(store.save()).resolves.toBe(false);

    expect(store.issue()).toBe('dayTitle');
    expect(store.showIssue()).toBe(true);
    expect(service.createDay).not.toHaveBeenCalled();
  });

  it('should refuse to save an exercise with blank repetitions or no sets', async () => {
    const store = TestBed.inject(CoachWorkoutEditorStore);
    await store.load('w1');
    store.addDay('Monday', 'monday', 'fullBody', false);
    const day = store.days()[0];
    store.addExercise(day.key, exercise);
    const key = store.days()[0].exercises[0].key;

    store.updateExercise(day.key, key, { targetReps: ' ' });
    expect(store.issue()).toBe('exercise');
    store.updateExercise(day.key, key, { targetReps: '8-12', targetSets: 0 });
    expect(store.issue()).toBe('exercise');
    store.updateExercise(day.key, key, { targetSets: 3 });

    expect(store.issue()).toBeNull();
  });

  it('should add several selected exercises to one day in order', async () => {
    const store = TestBed.inject(CoachWorkoutEditorStore);
    await store.load('w1');
    store.addDay('Monday', 'monday', 'fullBody', false);
    const day = store.days()[0];

    store.addExercises(day.key, [exercise, { ...exercise, id: 'e2', name: 'Lunge' }]);

    expect(store.days()[0].exercises.map((item) => item.exerciseId)).toEqual(['e1', 'e2']);
  });
});
