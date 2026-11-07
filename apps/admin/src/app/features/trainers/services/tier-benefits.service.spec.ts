import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '@core/http/api-base-url';
import { TierBenefitsService } from './tier-benefits.service';

describe('TierBenefitsService', () => {
  let service: TierBenefitsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    service = TestBed.inject(TierBenefitsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should read both tiers from the public endpoint when listing', async () => {
    const done = service.list();

    const request = http.expectOne('/api/public/trainer-tier-benefits');
    expect(request.request.method).toBe('GET');
    request.flush({
      isSuccess: true,
      data: [
        { tier: 1, benefits: [{ name: 'Programs', nameRu: 'Программы', nameUz: 'Dasturlar' }] },
        { tier: 2, benefits: [] },
      ],
    });

    expect(await done).toEqual([
      { tier: 'standard', benefits: [{ en: 'Programs', ru: 'Программы', uz: 'Dasturlar' }] },
      { tier: 'vip', benefits: [] },
    ]);
  });

  it('should put the whole ordered list under the Standard tier number when changing the Standard benefits', async () => {
    const done = service.change('standard', [
      { en: 'Second', ru: 'Второй', uz: 'Ikkinchi' },
      { en: 'First', ru: 'Первый', uz: 'Birinchi' },
    ]);

    const request = http.expectOne('/api/admin/trainer-tier-benefits/1');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      benefits: [
        { name: 'Second', nameRu: 'Второй', nameUz: 'Ikkinchi' },
        { name: 'First', nameRu: 'Первый', nameUz: 'Birinchi' },
      ],
    });
    request.flush({ isSuccess: true });
    await done;
  });

  it('should put an empty list under the VIP tier number when every benefit was removed', async () => {
    const done = service.change('vip', []);

    const request = http.expectOne('/api/admin/trainer-tier-benefits/2');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ benefits: [] });
    request.flush({ isSuccess: true });
    await done;
  });
});
