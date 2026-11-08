import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '@core/http/api-base-url';
import { PaymentOrdersService } from './payment-orders.service';

const USER_ID = '3e41b4c1-713a-4e0b-b2f7-5b5b0384cedf';
const REFERENCE_ID = '452bcf11-d084-4224-a4d2-54a589dfc707';

describe('PaymentOrdersService', () => {
  let service: PaymentOrdersService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    service = TestBed.inject(PaymentOrdersService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should send the page, the sort and every filter when all of them are set', async () => {
    const done = service.list(
      { status: 'paid', userId: USER_ID, referenceId: REFERENCE_ID },
      { first: 25, rows: 25, sortField: 'createdOnUtc', sortDirection: 'desc' },
    );

    const request = http.expectOne((candidate) => candidate.url === '/api/admin/payment-orders');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('First')).toBe('25');
    expect(request.request.params.get('Rows')).toBe('25');
    expect(request.request.params.get('SortField')).toBe('created_on_utc');
    expect(request.request.params.get('SortOrder')).toBe('-1');
    expect(request.request.params.get('Status')).toBe('2');
    expect(request.request.params.get('UserId')).toBe(USER_ID);
    expect(request.request.params.get('ReferenceId')).toBe(REFERENCE_ID);
    request.flush({ data: [], totalCount: 0 });

    expect(await done).toEqual({ items: [], totalCount: 0 });
  });

  it('should leave the filters out when none is set', async () => {
    const done = service.list({}, { first: 0, rows: 25 });

    const request = http.expectOne((candidate) => candidate.url === '/api/admin/payment-orders');
    expect(request.request.params.keys().sort()).toEqual(['First', 'Rows']);
    request.flush({ data: [], totalCount: 0 });
    await done;
  });

  it('should post a trainer subscription order and return its id when an order is created', async () => {
    const done = service.create({ userId: USER_ID, trainerId: REFERENCE_ID, price: 150000 });

    const request = http.expectOne('/api/admin/payment-orders');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      userId: USER_ID,
      purpose: 1,
      referenceId: REFERENCE_ID,
      price: 150000,
    });
    request.flush({ isSuccess: true, data: 'order-1' });

    expect(await done).toBe('order-1');
  });
});
