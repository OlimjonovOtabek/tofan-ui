import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '@core/http/api-base-url';
import { TierDto } from '@shared/models/tier.dto';
import { TrainerSubscriptionResponse } from './trainer-subscription.dto';
import { TrainerSubscriptionsService } from './trainer-subscriptions.service';

const response: TrainerSubscriptionResponse = {
  id: 's1',
  trainerId: 't1',
  trainerDisplayName: 'Jasur Karimov',
  userId: 'u1',
  startsOnUtc: '2026-10-01T10:00:00Z',
  endsOnUtc: '2026-11-01T10:00:00Z',
  endedOnUtc: null,
  grantedBy: 'a1',
  createdOnUtc: '2026-10-01T10:00:00Z',
  tier: TierDto.Vip,
};

describe('TrainerSubscriptionsService', () => {
  let service: TrainerSubscriptionsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    service = TestBed.inject(TrainerSubscriptionsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should put the vip tier number to the tier path when making a subscription vip', async () => {
    const done = service.changeTier('s1', 'vip');

    const request = http.expectOne('/api/admin/trainer-subscriptions/s1/tier');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ tier: 2 });
    request.flush({ isSuccess: true });
    await done;
  });

  it('should put the standard tier number to the tier path when making a subscription standard', async () => {
    const done = service.changeTier('s1', 'standard');

    const request = http.expectOne('/api/admin/trainer-subscriptions/s1/tier');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ tier: 1 });
    request.flush({ isSuccess: true });
    await done;
  });

  it('should encode the id in the path when the id has reserved characters', async () => {
    const done = service.changeTier('a/b', 'vip');

    const request = http.expectOne('/api/admin/trainer-subscriptions/a%2Fb/tier');
    request.flush({ isSuccess: true });
    await done;
  });

  it('should read the tier of every row when listing subscriptions', async () => {
    const done = service.list({}, { first: 0, rows: 25 });

    const request = http.expectOne(
      (candidate) => candidate.url === '/api/admin/trainer-subscriptions',
    );
    expect(request.request.method).toBe('GET');
    request.flush({
      data: [response, { ...response, id: 's2', tier: TierDto.Standard }],
      totalCount: 2,
    });

    const page = await done;
    expect(page.items.map((subscription) => subscription.tier)).toEqual(['vip', 'standard']);
    expect(page.totalCount).toBe(2);
  });
});
