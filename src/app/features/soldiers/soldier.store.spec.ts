import { TestBed } from '@angular/core/testing';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { SoldierProfile } from './models/soldier-profile';
import { WeightEntry } from './models/weight-entry';
import { SoldiersService } from './services/soldiers.service';
import { SoldierStore } from './soldier.store';

const USER_ID = 'c461dfe9-405f-4266-9e37-22e937f20f0c';

const profile = { userId: USER_ID, fullName: 'R T' } as SoldierProfile;

const weights: WeightEntry[] = [
  { id: '1', weightKg: 80, source: 'manual', note: null, loggedAt: new Date('2026-09-01') },
  { id: '2', weightKg: 78, source: 'manual', note: null, loggedAt: new Date('2026-09-14') },
];

describe('SoldierStore', () => {
  let service: Pick<SoldiersService, 'findProfile' | 'weightHistory'>;

  function createStore(): SoldierStore {
    TestBed.configureTestingModule({
      providers: [SoldierStore, { provide: SoldiersService, useValue: service }],
    });
    return TestBed.inject(SoldierStore);
  }

  beforeEach(() => {
    service = {
      findProfile: vi.fn().mockResolvedValue(profile),
      weightHistory: vi.fn().mockResolvedValue(weights),
    };
  });

  it('should expose the profile and the weight change when the soldier is found', async () => {
    const store = createStore();

    await store.load(USER_ID);

    expect(store.profile()).toBe(profile);
    expect(store.weightChange()?.deltaKg).toBe(-2);
    expect(store.notOnboarded()).toBe(false);
  });

  it('should report a missing onboarding when the account has no profile', async () => {
    vi.mocked(service.findProfile).mockResolvedValue(null);
    vi.mocked(service.weightHistory).mockResolvedValue([]);
    const store = createStore();

    await store.load(USER_ID);

    expect(store.notOnboarded()).toBe(true);
    expect(store.loadError()).toBeNull();
  });

  it('should expose the error instead of a missing onboarding when the request fails', async () => {
    vi.mocked(service.findProfile).mockRejectedValue(new ServiceUnavailableError());
    const store = createStore();

    await store.load(USER_ID);

    expect(store.loadError()).not.toBeNull();
    expect(store.notOnboarded()).toBe(false);
    expect(store.loading()).toBe(false);
  });
});
