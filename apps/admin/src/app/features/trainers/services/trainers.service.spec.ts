import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '@core/http/api-base-url';
import { TrainerEditDraft } from '../models/trainer-edit-draft';
import { TrainerResponse } from './trainer.dto';
import { TrainersService } from './trainers.service';

const editDraft: TrainerEditDraft = {
  email: 'jasur@example.com',
  phoneNumber: '+998901234567',
  displayName: 'Jasur Karimov',
  bio: 'Kalistenika',
  photoFileId: 'f1',
  monthlyPrice: 350000,
  vipMonthlyPrice: 700000,
};

describe('TrainersService', () => {
  let service: TrainersService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    service = TestBed.inject(TrainersService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should send the VIP price in the update body when the trainer sells VIP', async () => {
    const done = service.update('t1', editDraft);

    const request = http.expectOne('/api/admin/trainers/t1');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      email: 'jasur@example.com',
      phoneNumber: '+998901234567',
      displayName: 'Jasur Karimov',
      bio: 'Kalistenika',
      photoFileId: 'f1',
      monthlyPrice: 350000,
      vipMonthlyPrice: 700000,
    });
    request.flush({ isSuccess: true });
    await done;
  });

  it('should send a null VIP price in the update body when the trainer sells Standard only', async () => {
    const done = service.update('t1', { ...editDraft, vipMonthlyPrice: null });

    const request = http.expectOne('/api/admin/trainers/t1');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toStrictEqual({
      email: 'jasur@example.com',
      phoneNumber: '+998901234567',
      displayName: 'Jasur Karimov',
      bio: 'Kalistenika',
      photoFileId: 'f1',
      monthlyPrice: 350000,
      vipMonthlyPrice: null,
    });
    expect(JSON.stringify(request.request.body)).toContain('"vipMonthlyPrice":null');
    request.flush({ isSuccess: true });
    await done;
  });

  it('should map the VIP price of every trainer when the list is read', async () => {
    const done = service.list({ first: 0, rows: 20 });

    const request = http.expectOne((candidate) => candidate.url === '/api/admin/trainers');
    expect(request.request.method).toBe('GET');
    request.flush({
      data: [
        trainerResponse('t1', 700000),
        trainerResponse('t2', null),
        { ...trainerResponse('t3', null), vipMonthlyPrice: undefined },
      ],
      totalCount: 3,
    });
    const page = await done;

    expect(page.items.map((trainer) => trainer.vipMonthlyPrice)).toEqual([700000, null, null]);
  });
});

function trainerResponse(id: string, vipMonthlyPrice: number | null): TrainerResponse {
  return {
    id,
    userId: `u-${id}`,
    displayName: 'Jasur Karimov',
    slug: null,
    bio: null,
    photoFileId: null,
    monthlyPrice: 350000,
    vipMonthlyPrice,
    isPublished: true,
    createdOnUtc: '2026-10-02T09:00:00Z',
  };
}
