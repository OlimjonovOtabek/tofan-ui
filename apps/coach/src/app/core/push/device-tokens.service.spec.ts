import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '@core/http/api-base-url';
import { DeviceTokensService } from './device-tokens.service';

describe('DeviceTokensService', () => {
  let service: DeviceTokensService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    service = TestBed.inject(DeviceTokensService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should register the token as a web device', async () => {
    const done = service.register('t1');

    const request = http.expectOne('/api/device-tokens/me');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      token: 't1',
      deviceName: 'Tofan Coach Web',
      platform: 3,
    });
    request.flush({ isSuccess: true, data: 'id' });
    await done;
  });

  it('should send the token in the body when unregistering', async () => {
    const done = service.unregister('t1');

    const request = http.expectOne('/api/device-tokens/me');
    expect(request.request.method).toBe('DELETE');
    expect(request.request.body).toEqual({ token: 't1' });
    request.flush({ isSuccess: true });
    await done;
  });
});
