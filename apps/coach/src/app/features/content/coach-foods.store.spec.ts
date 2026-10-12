import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { ConflictError } from '@shared/models/errors/conflict.error';
import { CoachFoodsService } from './services/coach-foods.service';
import { CoachFoodsStore } from './coach-foods.store';

const food = {
  id: 'f1',
  userId: 'u1',
  name: 'Oatmeal',
  servingSizeGrams: 100,
  caloriesPerServing: 380,
  proteinGrams: 13,
  carbsGrams: 68,
  fatGrams: 7,
  fiberGrams: 10,
  createdOnUtc: '2026-10-01T00:00:00Z',
};

const request = {
  name: 'Oatmeal',
  servingSizeGrams: 100,
  caloriesPerServing: 380,
  proteinGrams: 13,
  carbsGrams: 68,
  fatGrams: 7,
  fiberGrams: 10,
};

describe('CoachFoodsStore', () => {
  let service: Pick<CoachFoodsService, 'list' | 'create' | 'update' | 'delete'>;
  let notifications: Pick<NotificationService, 'success' | 'error'>;

  beforeEach(() => {
    service = {
      list: vi.fn().mockResolvedValue([food]),
      create: vi.fn().mockResolvedValue('f1'),
      update: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    };
    notifications = { success: vi.fn(), error: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        CoachFoodsStore,
        { provide: CoachFoodsService, useValue: service },
        { provide: NotificationService, useValue: notifications },
      ],
    });
  });

  it('should expose owned foods from the backend', async () => {
    const store = TestBed.inject(CoachFoodsStore);

    await store.load();

    expect(store.items()).toEqual([food]);
  });

  it('should create a food and refresh the owned food list', async () => {
    const store = TestBed.inject(CoachFoodsStore);

    await expect(store.save(null, request)).resolves.toBe(true);

    expect(service.create).toHaveBeenCalledWith(request);
    expect(service.list).toHaveBeenCalledTimes(1);
    expect(notifications.success).toHaveBeenCalledWith('coach.content.foodSaved');
  });

  it('should update the selected food and refresh the owned food list', async () => {
    const store = TestBed.inject(CoachFoodsStore);

    await expect(store.save('f1', request)).resolves.toBe(true);

    expect(service.update).toHaveBeenCalledWith('f1', request);
  });

  it('should keep the operation unsuccessful and report a backend refusal', async () => {
    const refusal = new ConflictError('In use.', 'Food.InUse');
    vi.mocked(service.delete).mockRejectedValue(refusal);
    const store = TestBed.inject(CoachFoodsStore);

    await expect(store.remove('f1')).resolves.toBe(false);

    expect(notifications.error).toHaveBeenCalledWith(refusal);
    expect(service.list).not.toHaveBeenCalled();
  });

  it('should keep the list empty and expose an error when loading fails', async () => {
    vi.mocked(service.list).mockRejectedValue(new ConflictError('Nope.', 'Food.Nope'));
    const store = TestBed.inject(CoachFoodsStore);

    await store.load();

    expect(store.items()).toEqual([]);
    expect(store.error()).not.toBeNull();
  });

  it('should report a save failure without refreshing the list', async () => {
    const refusal = new ConflictError('In use.', 'Food.InUse');
    vi.mocked(service.update).mockRejectedValue(refusal);
    const store = TestBed.inject(CoachFoodsStore);

    await expect(store.save('f1', request)).resolves.toBe(false);

    expect(notifications.error).toHaveBeenCalledWith(refusal);
    expect(service.list).not.toHaveBeenCalled();
    expect(store.saving()).toBe(false);
  });

  it('should delete the selected food and refresh the list', async () => {
    const store = TestBed.inject(CoachFoodsStore);

    await expect(store.remove('f1')).resolves.toBe(true);

    expect(service.delete).toHaveBeenCalledWith('f1');
    expect(service.list).toHaveBeenCalledTimes(1);
  });
});
