import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PushConfigService } from './push-config.service';

describe('PushConfigService', () => {
  const config = {
    apiKey: 'key',
    appId: '1:2:web:3',
    projectId: 'tofan-dev',
    messagingSenderId: '2',
  };
  let service: PushConfigService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PushConfigService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should read the config the container wrote when it started', async () => {
    const loaded = service.load();

    http.expectOne('/push-config.json').flush(config);

    expect(await loaded).toEqual(config);
  });

  it('should ask the server only once when push is checked again', async () => {
    const first = service.load();
    const second = service.load();

    http.expectOne('/push-config.json').flush(config);

    expect(await first).toEqual(config);
    expect(await second).toEqual(config);
  });

  it('should turn push off when the config file is missing', async () => {
    const loaded = service.load();

    http.expectOne('/push-config.json').flush('', { status: 404, statusText: 'Not Found' });

    expect(await loaded).toBeNull();
  });
});
