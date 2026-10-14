import { TestBed } from '@angular/core/testing';
import { SoldierSummary } from './models/soldier-summary';
import { SoldiersService } from './services/soldiers.service';
import { SoldiersStore } from './soldiers.store';

const soldier = new SoldierSummary(
  'c461dfe9-405f-4266-9e37-22e937f20f0c',
  'Ali',
  'Valiyev',
  'ali_v',
  'male',
  'UZ',
  'loseWeight',
  'beginner',
  85.4,
  78,
  false,
  new Date('2026-08-01T10:00:00Z'),
);

describe('SoldiersStore', () => {
  let service: Pick<SoldiersService, 'list'>;

  function createStore(): SoldiersStore {
    TestBed.configureTestingModule({
      providers: [SoldiersStore, { provide: SoldiersService, useValue: service }],
    });
    return TestBed.inject(SoldiersStore);
  }

  beforeEach(() => {
    service = { list: vi.fn().mockResolvedValue({ items: [soldier], totalCount: 1 }) };
  });

  it('should expose the page when the service answers', async () => {
    const store = createStore();

    await store.load({ first: 0, rows: 25 });

    expect(store.soldiers()).toEqual([soldier]);
    expect(store.totalCount()).toBe(1);
  });

  it('should keep the sort and restart from the first page when the filter changes', async () => {
    const store = createStore();
    await store.load({ first: 50, rows: 25, sortField: 'currentWeightKg', sortDirection: 'asc' });

    await store.applyFilter({ goal: 'gainMuscle' });

    expect(service.list).toHaveBeenLastCalledWith(
      { goal: 'gainMuscle' },
      { first: 0, rows: 25, sortField: 'currentWeightKg', sortDirection: 'asc' },
    );
  });

  it('should expose the error and drop the old rows when a reload fails', async () => {
    const store = createStore();
    await store.load();
    vi.mocked(service.list).mockRejectedValue(new Error('offline'));

    await store.load();

    expect(store.loadError()).not.toBeNull();
    expect(store.soldiers()).toEqual([]);
  });
});
