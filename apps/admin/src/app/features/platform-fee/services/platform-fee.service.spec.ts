import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '@core/http/api-base-url';
import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { PlatformFeeService } from './platform-fee.service';

const PLATFORM_FEE_URL = '/api/admin/platform-fee';

describe('PlatformFeeService', () => {
  let service: PlatformFeeService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    service = TestBed.inject(PlatformFeeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should read the fee with its currency when the backend answers', async () => {
    const fee = service.get();

    const request = http.expectOne(PLATFORM_FEE_URL);
    expect(request.request.method).toBe('GET');
    request.flush({
      isSuccess: true,
      data: { commissionAmount: 50000, taxPercent: 0, providerFeePercent: 2, currencyCode: 'UZS' },
    });

    expect(await fee).toEqual({
      commissionAmount: 50000,
      taxPercent: 0,
      providerFeePercent: 2,
      currencyCode: 'UZS',
    });
  });

  it('should put only the three editable numbers when the fee is changed', async () => {
    const done = service.update({
      commissionAmount: 1500.5,
      taxPercent: 12,
      providerFeePercent: 2.25,
    });

    const request = http.expectOne(PLATFORM_FEE_URL);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      commissionAmount: 1500.5,
      taxPercent: 12,
      providerFeePercent: 2.25,
    });
    request.flush({ isSuccess: true });

    await expect(done).resolves.toBeUndefined();
  });

  it('should reject with the backend refusal when the change is not accepted', async () => {
    const done = service.update({ commissionAmount: 0, taxPercent: 0, providerFeePercent: 0 });
    const outcome = done.then(
      () => null,
      (error: unknown) => error,
    );

    http
      .expectOne(PLATFORM_FEE_URL)
      .flush(
        { title: 'PlatformFee.Invalid', status: 400 },
        { status: 400, statusText: 'Bad Request' },
      );

    const error = await outcome;
    expect(error).toBeInstanceOf(BusinessRuleError);
    expect((error as BusinessRuleError).code).toBe('PlatformFee.Invalid');
  });
});
