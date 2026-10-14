import { TestBed } from '@angular/core/testing';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { CoachClientDetailService } from './services/coach-client-detail.service';
import { CoachNutritionReportStore } from './coach-nutrition-report.store';

describe('CoachNutritionReportStore', () => {
  let service: Pick<CoachClientDetailService, 'getNutrition'>;

  beforeEach(() => {
    service = { getNutrition: vi.fn().mockResolvedValue([]) };
    TestBed.configureTestingModule({
      providers: [CoachNutritionReportStore, { provide: CoachClientDetailService, useValue: service }],
    });
  });

  it('should request the chosen range when the range changes', async () => {
    const store = TestBed.inject(CoachNutritionReportStore);
    await store.show('u1');

    await store.setNutritionRange({ from: '2026-09-01', to: '2026-09-07' });

    expect(service.getNutrition).toHaveBeenLastCalledWith('u1', '2026-09-01', '2026-09-07');
    expect(store.nutritionFrom()).toBe('2026-09-01');
  });

  it('should expose an error when the nutrition days fail to load', async () => {
    vi.mocked(service.getNutrition).mockRejectedValue(new ServiceUnavailableError());
    const store = TestBed.inject(CoachNutritionReportStore);

    await store.show('u1');

    expect(store.nutrition()).toEqual([]);
    expect(store.nutritionError()).toBe('errors.classes.network');
  });

  it('should not request anything when no client is shown', async () => {
    const store = TestBed.inject(CoachNutritionReportStore);

    await store.retryNutrition();

    expect(service.getNutrition).not.toHaveBeenCalled();
  });
});
