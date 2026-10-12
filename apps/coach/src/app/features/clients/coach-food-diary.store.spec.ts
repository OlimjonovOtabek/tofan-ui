import { TestBed } from '@angular/core/testing';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { CoachClientDetailService } from './services/coach-client-detail.service';
import { CoachFoodDiaryStore } from './coach-food-diary.store';

describe('CoachFoodDiaryStore', () => {
  let service: Pick<CoachClientDetailService, 'getFoodLogs'>;

  beforeEach(() => {
    service = { getFoodLogs: vi.fn().mockResolvedValue([]) };
    TestBed.configureTestingModule({
      providers: [CoachFoodDiaryStore, { provide: CoachClientDetailService, useValue: service }],
    });
  });

  it('should load the logs of the selected day', async () => {
    const store = TestBed.inject(CoachFoodDiaryStore);
    await store.show('u1');

    await store.selectDiaryDay('2026-10-03');

    expect(store.foodLogDate()).toBe('2026-10-03');
    expect(service.getFoodLogs).toHaveBeenLastCalledWith('u1', '2026-10-03');
  });

  it('should expose an error when the logs fail to load', async () => {
    vi.mocked(service.getFoodLogs).mockRejectedValue(new ServiceUnavailableError());
    const store = TestBed.inject(CoachFoodDiaryStore);

    await store.show('u1');

    expect(store.foodLogs()).toEqual([]);
    expect(store.foodLogsError()).toBe('errors.classes.network');
  });
});
