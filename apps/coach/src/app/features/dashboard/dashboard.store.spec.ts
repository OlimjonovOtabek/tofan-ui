import { TestBed } from '@angular/core/testing';
import { NotFoundError } from '@shared/models/errors/not-found.error';
import { Dashboard } from './models/dashboard';
import { DashboardStore } from './dashboard.store';
import { DashboardService } from './services/dashboard.service';

const dashboard: Dashboard = {
  earnings: null,
  subscribers: null,
  programs: null,
  expiring: [],
  lowActivity: [],
  recentPayments: [],
};

describe('DashboardStore', () => {
  const get = vi.fn();
  let store: DashboardStore;

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      providers: [DashboardStore, { provide: DashboardService, useValue: { get } }],
    });
    store = TestBed.inject(DashboardStore);
  });

  it('should show the dashboard when it loads', async () => {
    get.mockResolvedValue(dashboard);

    await store.load();

    expect(store.dashboard()).toBe(dashboard);
    expect(store.loadError()).toBeNull();
    expect(store.loading()).toBe(false);
  });

  it('should keep an error and no data when the load fails', async () => {
    get.mockRejectedValue(new NotFoundError('missing'));

    await store.load();

    expect(store.dashboard()).toBeNull();
    expect(store.loadError()).not.toBeNull();
  });
});
