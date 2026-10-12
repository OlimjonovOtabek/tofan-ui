import { TestBed } from '@angular/core/testing';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { CoachClientProfile } from './models/coach-client';
import { CoachWeightPoint } from './services/coach-client-detail.dto';
import { CoachClientDetailService } from './services/coach-client-detail.service';
import { CLIENT_DETAIL_STORES } from './coach-client-detail.providers';
import { CoachClientDetailStore } from './coach-client-detail.store';
import { CoachWeightReportStore } from './coach-weight-report.store';
import { CoachWorkoutReportStore } from './coach-workout-report.store';
import { CoachClientsService } from './services/coach-clients.service';

function profileOf(userId: string): CoachClientProfile {
  return {
    profileId: `p-${userId}`,
    userId,
    firstName: userId,
    lastName: 'Client',
    userName: userId,
    profilePhotoUrl: null,
    timeZone: 'UTC',
    heightCm: null,
    currentWeightKg: null,
    targetWeightKg: null,
    goal: null,
    goalTargetDate: null,
  };
}

function weight(id: string, weightKg: number): CoachWeightPoint {
  return { id, weightKg, loggedDate: '2026-10-01', loggedOnUtc: '2026-10-01T00:00:00Z', note: null };
}

const adherence = {
  fromDate: '2026-10-01',
  toDate: '2026-10-07',
  scheduledDays: 0,
  completedDays: 0,
  missedDays: 0,
  restDays: 0,
  adherencePercent: 0,
  days: [],
};

describe('CoachClientDetailStore', () => {
  let service: Pick<
    CoachClientDetailService,
    'getProfile' | 'getWeightHistory' | 'getSessions' | 'getAdherence' | 'getNutrition' | 'getFoodLogs'
  >;
  let clients: Pick<CoachClientsService, 'list'>;

  beforeEach(() => {
    service = {
      getProfile: vi.fn((userId: string) => Promise.resolve(profileOf(userId))),
      getWeightHistory: vi.fn().mockResolvedValue([weight('w1', 80)]),
      getSessions: vi.fn().mockResolvedValue({ items: [], totalCount: 0 }),
      getAdherence: vi.fn().mockResolvedValue(adherence),
      getNutrition: vi.fn().mockResolvedValue([]),
      getFoodLogs: vi.fn().mockResolvedValue([]),
    };
    clients = { list: vi.fn().mockResolvedValue([]) };
    TestBed.configureTestingModule({
      providers: [
        ...CLIENT_DETAIL_STORES,
        { provide: CoachClientDetailService, useValue: service },
        { provide: CoachClientsService, useValue: clients },
      ],
    });
  });

  it('should keep the profile visible when one report block fails', async () => {
    vi.mocked(service.getWeightHistory).mockRejectedValue(new ServiceUnavailableError());
    const store = TestBed.inject(CoachClientDetailStore);
    const weightReport = TestBed.inject(CoachWeightReportStore);

    await store.load('u1');

    expect(store.profile()?.userId).toBe('u1');
    expect(weightReport.weights()).toEqual([]);
    expect(weightReport.weightError()).toBe('errors.classes.network');
    expect(TestBed.inject(CoachWorkoutReportStore).adherenceError()).toBeNull();
  });

  it('should clear the previous client data while a different client loads', async () => {
    const store = TestBed.inject(CoachClientDetailStore);
    await store.load('u1');
    let release: (profile: CoachClientProfile) => void = () => undefined;
    vi.mocked(service.getProfile).mockReturnValue(new Promise((resolve) => (release = resolve)));

    const second = store.load('u2');

    expect(store.profile()).toBeNull();
    expect(TestBed.inject(CoachWeightReportStore).weights()).toEqual([]);
    release(profileOf('u2'));
    await second;
    expect(store.profile()?.userId).toBe('u2');
  });

  it('should ignore a slow response from a client that was replaced by another one', async () => {
    let releaseFirst: (profile: CoachClientProfile) => void = () => undefined;
    vi.mocked(service.getProfile)
      .mockReturnValueOnce(new Promise((resolve) => (releaseFirst = resolve)))
      .mockResolvedValueOnce(profileOf('u2'));
    const store = TestBed.inject(CoachClientDetailStore);

    const first = store.load('u1');
    await store.load('u2');
    releaseFirst(profileOf('u1'));
    await first;

    expect(store.profile()?.userId).toBe('u2');
  });

  it('should expose a profile error and no reports when the client is inaccessible', async () => {
    vi.mocked(service.getProfile).mockRejectedValue(new ServiceUnavailableError());
    const store = TestBed.inject(CoachClientDetailStore);

    await store.load('u9');

    expect(store.profile()).toBeNull();
    expect(store.profileError()).toBe('errors.classes.network');
    expect(service.getWeightHistory).not.toHaveBeenCalled();
    expect(store.loading()).toBe(false);
  });
});
