import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { ValidationError } from '@shared/models/errors/validation.error';
import { Tariff } from './models/tariff';
import { TariffDraft } from './models/tariff-draft';
import { TariffsService } from './services/tariffs.service';
import { TariffsStore } from './tariffs.store';

const standard: Tariff = {
  id: 't2',
  type: 'standard',
  monthlyPrice: 49000,
  totalPrice: 99000,
  foodScanLimit: 15,
  workoutVideoLimit: null,
  dietMealTypes: null,
  workoutChangeMonths: null,
  dietChangeDays: null,
  hasAiTrainerChat: true,
  benefits: [],
};

const draft: TariffDraft = {
  monthlyPrice: 59000,
  foodScanLimit: null,
  workoutVideoLimit: null,
  dietMealTypes: null,
  workoutChangeMonths: null,
  dietChangeDays: null,
  hasAiTrainerChat: true,
};

describe('TariffsStore', () => {
  let service: Pick<TariffsService, 'list' | 'change'>;
  let notifications: Pick<NotificationService, 'success' | 'error'>;

  function createStore(): TariffsStore {
    TestBed.configureTestingModule({
      providers: [
        TariffsStore,
        { provide: TariffsService, useValue: service },
        { provide: NotificationService, useValue: notifications },
      ],
    });
    return TestBed.inject(TariffsStore);
  }

  beforeEach(() => {
    service = {
      list: vi.fn().mockResolvedValue([standard]),
      change: vi.fn().mockResolvedValue(undefined),
    };
    notifications = { success: vi.fn(), error: vi.fn() };
  });

  it('should expose the tariffs when the service answers', async () => {
    const store = createStore();

    await store.load();

    expect(store.tariffs()).toEqual([standard]);
    expect(store.loadError()).toBeNull();
    expect(store.loading()).toBe(false);
  });

  it('should keep the error and no tariffs when the service fails', async () => {
    service.list = vi.fn().mockRejectedValue(new ServiceUnavailableError('down'));
    const store = createStore();

    await store.load();

    expect(store.tariffs()).toEqual([]);
    expect(store.loadError()).not.toBeNull();
  });

  it('should send the draft and reload the list when a tariff is saved', async () => {
    const saved: Tariff = { ...standard, monthlyPrice: 59000, totalPrice: 109000 };
    service.list = vi.fn().mockResolvedValue([saved]);
    const store = createStore();

    const done = await store.change('standard', draft);

    expect(done).toBe(true);
    expect(service.change).toHaveBeenCalledWith('standard', draft);
    expect(service.list).toHaveBeenCalledTimes(1);
    expect(store.tariffs()).toEqual([saved]);
    expect(notifications.success).toHaveBeenCalledWith('tariffs.toast.saved');
    expect(store.saving()).toBe(false);
  });

  it('should not call the backend when a Free tariff carries a price', async () => {
    const store = createStore();

    const done = await store.change('free', draft);

    expect(done).toBe(false);
    expect(service.change).not.toHaveBeenCalled();
    expect(notifications.error).toHaveBeenCalledWith(expect.any(ValidationError));
    expect(store.saving()).toBe(false);
  });

  it('should report the error and skip the reload when the backend refuses', async () => {
    const refusal = new BusinessRuleError('refused', 'Tariff.PaidPriceRequired');
    service.change = vi.fn().mockRejectedValue(refusal);
    const store = createStore();

    const done = await store.change('standard', draft);

    expect(done).toBe(false);
    expect(notifications.error).toHaveBeenCalledWith(refusal);
    expect(service.list).not.toHaveBeenCalled();
    expect(store.saving()).toBe(false);
  });

  it('should keep the saved result when the reload fails after a save', async () => {
    service.list = vi.fn().mockRejectedValue(new ServiceUnavailableError('down'));
    const store = createStore();

    const done = await store.change('standard', draft);

    expect(done).toBe(true);
    expect(store.loadError()).not.toBeNull();
  });
});
