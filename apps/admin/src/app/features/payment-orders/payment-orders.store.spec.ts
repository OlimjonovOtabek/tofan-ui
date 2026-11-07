import { TestBed } from '@angular/core/testing';
import { NotFoundError } from '@shared/models/errors/not-found.error';
import { PaymentOrder } from './models/payment-order';
import { PaymentOrdersService } from './services/payment-orders.service';
import { PaymentOrdersStore } from './payment-orders.store';

const order: PaymentOrder = {
  id: 'o1',
  userId: 'u1',
  purpose: 'tariff',
  referenceId: 'tariff-2',
  tier: null,
  price: 120000,
  commissionAmount: 0,
  taxPercent: 0,
  taxAmount: 0,
  providerFeePercent: 0,
  providerFeeAmount: 0,
  amount: 120000,
  status: 'pending',
  paidWith: null,
  createdAt: new Date('2026-11-05T10:30:00Z'),
  paidAt: null,
  refundedAt: null,
};

describe('PaymentOrdersStore', () => {
  let service: { list: ReturnType<typeof vi.fn> };

  function createStore(): PaymentOrdersStore {
    TestBed.configureTestingModule({
      providers: [PaymentOrdersStore, { provide: PaymentOrdersService, useValue: service }],
    });
    return TestBed.inject(PaymentOrdersStore);
  }

  beforeEach(() => {
    service = { list: vi.fn().mockResolvedValue({ items: [order], totalCount: 1 }) };
  });

  it('should expose the page when the service answers', async () => {
    const store = createStore();

    await store.load({ first: 25, rows: 25 });

    expect(store.orders()).toEqual([order]);
    expect(store.totalCount()).toBe(1);
    expect(store.first()).toBe(25);
    expect(store.loading()).toBe(false);
    expect(store.loadError()).toBeNull();
  });

  it('should clear the page and keep the error when the service fails', async () => {
    service.list.mockRejectedValue(new NotFoundError('missing', 'General.NotFound'));
    const store = createStore();

    await store.load({ first: 0, rows: 25 });

    expect(store.orders()).toEqual([]);
    expect(store.loadError()).not.toBeNull();
    expect(store.loading()).toBe(false);
  });

  it('should go back to the first page and keep the sort when a filter is applied', async () => {
    const store = createStore();
    await store.load({ first: 50, rows: 25, sortField: 'amount', sortDirection: 'asc' });

    await store.applyFilter({ status: 'paid' });

    expect(service.list).toHaveBeenLastCalledWith(
      { status: 'paid' },
      { first: 0, rows: 25, sortField: 'amount', sortDirection: 'asc' },
    );
    expect(store.first()).toBe(0);
  });

  it('should only remember the filter when it arrives before the first page', async () => {
    const store = createStore();

    await store.applyFilter({ userId: 'u1' });

    expect(service.list).not.toHaveBeenCalled();
    await store.load({ first: 0, rows: 25 });
    expect(service.list).toHaveBeenCalledWith({ userId: 'u1' }, { first: 0, rows: 25 });
  });

  it('should keep the newest page when an older answer arrives late', async () => {
    let answerFirst: (page: { items: PaymentOrder[]; totalCount: number }) => void = () =>
      undefined;
    service.list
      .mockImplementationOnce(() => new Promise((resolve) => (answerFirst = resolve)))
      .mockResolvedValueOnce({ items: [], totalCount: 0 });
    const store = createStore();

    const first = store.load({ first: 0, rows: 25 });
    await store.load({ first: 25, rows: 25 });
    answerFirst({ items: [order], totalCount: 1 });
    await first;

    expect(store.orders()).toEqual([]);
    expect(store.totalCount()).toBe(0);
    expect(store.loading()).toBe(false);
  });

  it('should reload the current page with the current filter when retried', async () => {
    const store = createStore();
    await store.load({ first: 25, rows: 25 });
    await store.applyFilter({ status: 'refunded' });
    service.list.mockClear();

    await store.load();

    expect(service.list).toHaveBeenCalledWith({ status: 'refunded' }, { first: 0, rows: 25 });
  });
});
