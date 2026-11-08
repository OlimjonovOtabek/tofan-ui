import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '@core/http/api-base-url';
import { SoldierLookupService } from './soldier-lookup.service';

describe('SoldierLookupService', () => {
  let service: SoldierLookupService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    service = TestBed.inject(SoldierLookupService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should search the soldiers by text and map them to options', async () => {
    const done = service.search('otabek', 10);

    const request = http.expectOne((candidate) => candidate.url === '/api/admin/soldiers');
    expect(request.request.params.get('Search')).toBe('otabek');
    expect(request.request.params.get('First')).toBe('0');
    expect(request.request.params.get('Rows')).toBe('10');
    request.flush({
      data: [
        {
          userId: '73f8e8f0-90a3-49e2-b42a-3111072bceb4',
          firstName: 'Otabek',
          lastName: 'Olimjonov',
          userName: 'otabek',
        },
      ],
      totalCount: 1,
    });

    expect(await done).toEqual([
      {
        userId: '73f8e8f0-90a3-49e2-b42a-3111072bceb4',
        label: 'Otabek Olimjonov',
        userName: 'otabek',
      },
    ]);
  });

  it('should send no search when the text is empty', async () => {
    const done = service.search('', 10);

    const request = http.expectOne((candidate) => candidate.url === '/api/admin/soldiers');
    expect(request.request.params.has('Search')).toBe(false);
    request.flush({ data: [], totalCount: 0 });

    expect(await done).toEqual([]);
  });
});
