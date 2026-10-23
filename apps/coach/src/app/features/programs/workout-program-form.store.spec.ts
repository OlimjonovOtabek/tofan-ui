import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { EMPTY_DAY_DRAFT } from './models/day-draft';
import { WorkoutProgramsService } from './services/workout-programs.service';
import { WorkoutProgramFormStore } from './workout-program-form.store';

describe('WorkoutProgramFormStore', () => {
  const service = { create: vi.fn(), update: vi.fn(), get: vi.fn() };
  const notifications = { success: vi.fn(), error: vi.fn() };
  let store: WorkoutProgramFormStore;

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      providers: [
        WorkoutProgramFormStore,
        { provide: WorkoutProgramsService, useValue: service },
        { provide: NotificationService, useValue: notifications },
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

  it('should edit and remove days in the draft list', async () => {
    store.saveDay(null, { ...EMPTY_DAY_DRAFT, title: 'A' });
    store.saveDay(null, { ...EMPTY_DAY_DRAFT, title: 'B' });
    store.saveDay(0, { ...EMPTY_DAY_DRAFT, title: 'A2' });
    store.removeDay(1);

    expect(store.days().map((day) => day.title)).toEqual(['A2']);
  });
});
