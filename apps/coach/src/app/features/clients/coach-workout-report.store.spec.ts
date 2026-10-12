import { TestBed } from '@angular/core/testing';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { Page } from '@shared/models/page';
import { CoachAdherence, CoachWorkoutSession } from './models/coach-client';
import { CoachClientDetailService } from './services/coach-client-detail.service';
import { CoachWorkoutReportStore } from './coach-workout-report.store';

const adherence: CoachAdherence = {
  fromDate: '2026-10-01',
  toDate: '2026-10-07',
  scheduledDays: 0,
  completedDays: 0,
  missedDays: 0,
  restDays: 0,
  adherencePercent: 0,
  days: [],
};

function session(id: string): CoachWorkoutSession {
  return {
    id,
    planDayTitle: 'Day',
    status: 'started',
    startedOnUtc: '2026-10-01T00:00:00Z',
    completedOnUtc: null,
    durationMinutes: 30,
    estimatedCaloriesBurned: 100,
    exerciseCount: 1,
    completedSetCount: 3,
    totalVolumeKg: 500,
  };
}

describe('CoachWorkoutReportStore', () => {
  let service: Pick<CoachClientDetailService, 'getSessions' | 'getAdherence'>;

  beforeEach(() => {
    service = {
      getSessions: vi.fn().mockResolvedValue({ items: [], totalCount: 0 }),
      getAdherence: vi.fn().mockResolvedValue(adherence),
    };
    TestBed.configureTestingModule({
      providers: [CoachWorkoutReportStore, { provide: CoachClientDetailService, useValue: service }],
    });
  });

  it('should keep the sessions when only the adherence fails to load', async () => {
    vi.mocked(service.getSessions).mockResolvedValue({ items: [session('s1')], totalCount: 1 });
    vi.mocked(service.getAdherence).mockRejectedValue(new ServiceUnavailableError());
    const store = TestBed.inject(CoachWorkoutReportStore);

    await store.show('u1');

    expect(store.sessions()?.items.map((item) => item.id)).toEqual(['s1']);
    expect(store.adherence()).toBeNull();
    expect(store.adherenceError()).toBe('errors.classes.network');
  });

  it('should append the next sessions page without duplicating known sessions', async () => {
    vi.mocked(service.getSessions)
      .mockResolvedValueOnce({ items: [session('s1'), session('s2')], totalCount: 3 })
      .mockResolvedValueOnce({ items: [session('s2'), session('s3')], totalCount: 3 });
    const store = TestBed.inject(CoachWorkoutReportStore);
    await store.show('u1');

    await store.moreSessions();

    expect(store.sessions()?.items.map((item) => item.id)).toEqual(['s1', 's2', 's3']);
    expect(store.canLoadMoreSessions()).toBe(false);
    expect(service.getSessions).toHaveBeenLastCalledWith('u1', 2, expect.any(String), expect.any(String), undefined);
  });

  it('should drop a late next page when the session filter changed meanwhile', async () => {
    let releaseMore: (page: Page<CoachWorkoutSession>) => void = () => undefined;
    vi.mocked(service.getSessions)
      .mockResolvedValueOnce({ items: [session('s1')], totalCount: 2 })
      .mockReturnValueOnce(new Promise((resolve) => (releaseMore = resolve)))
      .mockResolvedValueOnce({ items: [session('f1')], totalCount: 1 });
    const store = TestBed.inject(CoachWorkoutReportStore);
    await store.show('u1');

    const more = store.moreSessions();
    await store.setSessionStatus('started');
    releaseMore({ items: [session('s2')], totalCount: 2 });
    await more;

    expect(store.sessions()?.items.map((item) => item.id)).toEqual(['f1']);
    expect(service.getSessions).toHaveBeenLastCalledWith('u1', 0, expect.any(String), expect.any(String), 'started');
  });

  it('should reload sessions and adherence when the range changes', async () => {
    const store = TestBed.inject(CoachWorkoutReportStore);
    await store.show('u1');

    await store.setWorkoutRange({ from: '2026-09-01', to: '2026-09-07' });

    expect(service.getSessions).toHaveBeenLastCalledWith('u1', 0, '2026-09-01', '2026-09-07', undefined);
    expect(service.getAdherence).toHaveBeenLastCalledWith('u1', '2026-09-01', '2026-09-07');
  });
});
