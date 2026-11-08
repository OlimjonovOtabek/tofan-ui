import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '@core/http/api-base-url';
import { TrainerOptionsService } from './trainer-options.service';

describe('TrainerOptionsService', () => {
  let service: TrainerOptionsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    service = TestBed.inject(TrainerOptionsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should read the first hundred trainers when the options are loaded', async () => {
    const done = service.list();

    const request = http.expectOne((candidate) => candidate.url === '/api/admin/trainers');
    expect(request.request.params.get('First')).toBe('0');
    expect(request.request.params.get('Rows')).toBe('100');
    request.flush({
      data: [
        {
          id: '452bcf11-d084-4224-a4d2-54a589dfc707',
          userId: '6ff7b6f8-5248-4c0d-a78f-9c9d7c320b55',
          displayName: 'Stage Coach',
          monthlyPrice: 200000,
          vipMonthlyPrice: 400000,
        },
      ],
      totalCount: 1,
    });

    expect(await done).toEqual([
      {
        id: '452bcf11-d084-4224-a4d2-54a589dfc707',
        displayName: 'Stage Coach',
        standardPrice: 200000,
      },
    ]);
  });
});
