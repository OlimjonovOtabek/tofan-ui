import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { Benefit } from '@shared/models/benefit';
import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { TierBenefits } from './models/tier-benefits';
import { TierBenefitsService } from './services/tier-benefits.service';
import { TrainerTiersStore } from './trainer-tiers.store';

const programs: Benefit = { en: 'Programs', ru: 'Программы', uz: 'Dasturlar' };
const chat: Benefit = { en: '1:1 chat', ru: 'Чат 1:1', uz: '1:1 chat' };

const tiers: TierBenefits[] = [
  { tier: 'standard', benefits: [programs] },
  { tier: 'vip', benefits: [programs, chat] },
];

describe('TrainerTiersStore', () => {
  let service: Pick<TierBenefitsService, 'list' | 'change'>;
  let notifications: Pick<NotificationService, 'success' | 'error'>;

  function createStore(): TrainerTiersStore {
    TestBed.configureTestingModule({
      providers: [
        TrainerTiersStore,
        { provide: TierBenefitsService, useValue: service },
        { provide: NotificationService, useValue: notifications },
      ],
    });
    return TestBed.inject(TrainerTiersStore);
  }

  beforeEach(() => {
    service = {
      list: vi.fn().mockResolvedValue(tiers),
      change: vi.fn().mockResolvedValue(undefined),
    };
    notifications = { success: vi.fn(), error: vi.fn() };
  });

  it('should expose both tiers when the service answers', async () => {
    const store = createStore();

    await store.load();

    expect(store.tiers()).toEqual(tiers);
    expect(store.loading()).toBe(false);
    expect(store.loadError()).toBeNull();
  });

  it('should be loading while the service has not answered', async () => {
    let answer: (value: TierBenefits[]) => void = () => undefined;
    vi.mocked(service.list).mockReturnValue(new Promise((resolve) => (answer = resolve)));
    const store = createStore();

    const loading = store.load();

    expect(store.loading()).toBe(true);
    answer(tiers);
    await loading;
    expect(store.loading()).toBe(false);
  });

  it('should expose the error and drop the old tiers when a reload fails', async () => {
    const store = createStore();
    await store.load();
    vi.mocked(service.list).mockRejectedValue(new ServiceUnavailableError());

    await store.load();

    expect(store.tiers()).toEqual([]);
    expect(store.loadError()).not.toBeNull();
    expect(notifications.error).not.toHaveBeenCalled();
  });

  it('should clear the error when a retry succeeds', async () => {
    vi.mocked(service.list).mockRejectedValueOnce(new ServiceUnavailableError());
    const store = createStore();
    await store.load();

    await store.load();

    expect(store.loadError()).toBeNull();
    expect(store.tiers()).toEqual(tiers);
  });

  it('should send the whole ordered list and reload when a tier is saved', async () => {
    const store = createStore();
    await store.load();
    const reordered = [chat, programs];

    const saved = await store.changeBenefits('vip', reordered);

    expect(saved).toBe(true);
    expect(service.change).toHaveBeenCalledWith('vip', reordered);
    expect(service.list).toHaveBeenCalledTimes(2);
    expect(notifications.success).toHaveBeenCalledWith('trainers.tiers.saved');
    expect(store.saving()).toBe(false);
  });

  it('should show the backend error and keep the tiers when saving is refused', async () => {
    const store = createStore();
    await store.load();
    const refusal = new BusinessRuleError('refused', 'General.Validation');
    vi.mocked(service.change).mockRejectedValue(refusal);

    const saved = await store.changeBenefits('standard', [chat]);

    expect(saved).toBe(false);
    expect(notifications.error).toHaveBeenCalledWith(refusal);
    expect(notifications.success).not.toHaveBeenCalled();
    expect(service.list).toHaveBeenCalledTimes(1);
    expect(store.tiers()).toEqual(tiers);
    expect(store.saving()).toBe(false);
  });

  it('should be saving while the write has not finished', async () => {
    let finish: () => void = () => undefined;
    vi.mocked(service.change).mockReturnValue(new Promise((resolve) => (finish = () => resolve())));
    const store = createStore();

    const saving = store.changeBenefits('vip', [chat]);

    expect(store.saving()).toBe(true);
    finish();
    await saving;
    expect(store.saving()).toBe(false);
  });
});
