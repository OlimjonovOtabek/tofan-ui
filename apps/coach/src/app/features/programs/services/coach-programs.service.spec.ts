import { TestBed } from '@angular/core/testing';
import { ApiClient } from '@core/http/api-client';
import { CoachProgramsService } from './coach-programs.service';

describe('CoachProgramsService', () => {
  const api = { post: vi.fn().mockResolvedValue('m1') };

  beforeEach(() => {
    api.post.mockClear();
    TestBed.configureTestingModule({
      providers: [CoachProgramsService, { provide: ApiClient, useValue: api }],
    });
  });

  it('should send the date range as the required name when creating a meal program', async () => {
    const service = TestBed.inject(CoachProgramsService);

    await service.createMeal({ startDate: '2026-10-11', endDate: '2026-10-17', meals: [] });

    expect(api.post).toHaveBeenCalledWith('/coach/meal-programs', {
      startDate: '2026-10-11',
      endDate: '2026-10-17',
      meals: [],
      name: '2026-10-11 – 2026-10-17',
    });
  });
});
