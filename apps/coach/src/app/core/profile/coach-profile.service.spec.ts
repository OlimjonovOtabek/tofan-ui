import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '@core/http/api-base-url';
import { CoachProfileResponse } from './coach-profile.dto';
import { CoachProfileService } from './coach-profile.service';

const response: CoachProfileResponse = {
  id: 't1',
  userId: 'u1',
  displayName: 'Coach One',
  slug: 'coach-one',
  bio: null,
  photoFileId: null,
  monthlyPrice: 200000,
  vipMonthlyPrice: 400000,
  isPublished: true,
  createdOnUtc: '2026-10-01T00:00:00Z',
};

describe('CoachProfileService', () => {
  let service: CoachProfileService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    service = TestBed.inject(CoachProfileService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should read the VIP price from the profile when the profile is requested', async () => {
    const done = service.get();

    const request = http.expectOne('/api/coach/profile');
    expect(request.request.method).toBe('GET');
    request.flush({ isSuccess: true, data: response });

    expect(await done).toMatchObject({ monthlyPrice: 200000, vipMonthlyPrice: 400000 });
  });

  it('should send a null VIP price in the update body when the coach sells Standard only', async () => {
    const done = service.update({
      displayName: 'Coach One',
      bio: null,
      photoFileId: null,
      monthlyPrice: 200000,
      vipMonthlyPrice: null,
    });

    const request = http.expectOne('/api/coach/profile');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      displayName: 'Coach One',
      monthlyPrice: 200000,
      vipMonthlyPrice: null,
    });
    expect(JSON.stringify(request.request.body)).toContain('"vipMonthlyPrice":null');
    request.flush({ isSuccess: true });
    await done;
  });

  it('should send the VIP price in the update body when the coach sells VIP', async () => {
    const done = service.update({
      displayName: 'Coach One',
      bio: 'Bio',
      photoFileId: 'f1',
      monthlyPrice: 200000,
      vipMonthlyPrice: 400000,
      slug: 'coach-one',
    });

    const request = http.expectOne('/api/coach/profile');
    expect(request.request.body).toEqual({
      displayName: 'Coach One',
      bio: 'Bio',
      photoFileId: 'f1',
      monthlyPrice: 200000,
      vipMonthlyPrice: 400000,
      slug: 'coach-one',
    });
    request.flush({ isSuccess: true });
    await done;
  });
});
