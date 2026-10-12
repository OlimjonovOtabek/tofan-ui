import { TestBed } from '@angular/core/testing';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { CoachWeightPoint } from './services/coach-client-detail.dto';
import { CoachClientDetailService } from './services/coach-client-detail.service';
import { CoachWeightReportStore } from './coach-weight-report.store';

function weight(id: string, weightKg: number): CoachWeightPoint {
  return { id, weightKg, loggedDate: '2026-10-01', loggedOnUtc: '2026-10-01T00:00:00Z', note: null };
}

describe('CoachWeightReportStore', () => {
  let service: Pick<CoachClientDetailService, 'getWeightHistory'>;

  beforeEach(() => {
    service = { getWeightHistory: vi.fn().mockResolvedValue([weight('w1', 80)]) };
    TestBed.configureTestingModule({
      providers: [CoachWeightReportStore, { provide: CoachClientDetailService, useValue: service }],
    });
  });

  it('should load the weight history when a client is shown', async () => {
    const store = TestBed.inject(CoachWeightReportStore);

    await store.show('u1');

    expect(store.weights().map((point) => point.id)).toEqual(['w1']);
    expect(store.weightError()).toBeNull();
  });

  it('should expose an error and no weights when the history fails to load', async () => {
    vi.mocked(service.getWeightHistory).mockRejectedValue(new ServiceUnavailableError());
    const store = TestBed.inject(CoachWeightReportStore);

    await store.show('u1');

    expect(store.weights()).toEqual([]);
    expect(store.weightError()).toBe('errors.classes.network');
  });

  it('should not let an older range response overwrite the newest range', async () => {
    let releaseOld: (points: readonly CoachWeightPoint[]) => void = () => undefined;
    const store = TestBed.inject(CoachWeightReportStore);
    await store.show('u1');
    vi.mocked(service.getWeightHistory)
      .mockReturnValueOnce(new Promise((resolve) => (releaseOld = resolve)))
      .mockResolvedValueOnce([weight('new', 70)]);

    const older = store.setWeightRange({ from: '2026-01-01', to: '2026-02-01' });
    await store.setWeightRange({ from: '2026-09-01', to: '2026-10-01' });
    releaseOld([weight('old', 99)]);
    await older;

    expect(store.weights().map((point) => point.id)).toEqual(['new']);
    expect(store.weightFrom()).toBe('2026-09-01');
  });

  it('should drop a late response when the report was cleared', async () => {
    let release: (points: readonly CoachWeightPoint[]) => void = () => undefined;
    vi.mocked(service.getWeightHistory).mockReturnValue(new Promise((resolve) => (release = resolve)));
    const store = TestBed.inject(CoachWeightReportStore);

    const pending = store.show('u1');
    store.clear();
    release([weight('late', 90)]);
    await pending;

    expect(store.weights()).toEqual([]);
  });
});
