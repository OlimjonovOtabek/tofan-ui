import { TestBed } from '@angular/core/testing';
import { ApiClient } from '@core/http/api-client';
import { CoachClientDetailService } from './coach-client-detail.service';

describe('CoachClientDetailService', () => {
  let api: Pick<ApiClient, 'get'>;

  beforeEach(() => {
    api = { get: vi.fn().mockResolvedValue({ data: [], totalCount: 0 }) };
    TestBed.configureTestingModule({
      providers: [CoachClientDetailService, { provide: ApiClient, useValue: api }],
    });
  });

  it('should send the coach browser time zone with date-based nutrition requests', async () => {
    const service = TestBed.inject(CoachClientDetailService);

    await service.getNutrition('u1', '2026-10-01', '2026-10-07');

    const headers = vi.mocked(api.get).mock.calls[0][2];
    expect(headers?.get('X-Time-Zone')).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone);
    expect(vi.mocked(api.get).mock.calls[0][1]).toEqual({
      FromDate: '2026-10-01',
      ToDate: '2026-10-07',
    });
  });

  it('should map the nested workout sessions page into the shared page model', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: [{ id: 's1', status: 3 }], totalCount: 1 });
    const service = TestBed.inject(CoachClientDetailService);

    await expect(service.getSessions('u1', 0, '2026-10-01', '2026-10-07', 'completed')).resolves.toEqual({
      items: [{ id: 's1', status: 'completed' }],
      totalCount: 1,
    });
    expect(vi.mocked(api.get).mock.calls[0][1]).toMatchObject({ Status: 3 });
  });
});
