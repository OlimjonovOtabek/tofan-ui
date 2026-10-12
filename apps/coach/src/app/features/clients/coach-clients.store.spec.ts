import { TestBed } from '@angular/core/testing';
import { NotFoundError } from '@shared/models/errors/not-found.error';
import { CoachClientsService } from './services/coach-clients.service';
import { CoachClientsStore } from './coach-clients.store';

describe('CoachClientsStore', () => {
  let service: Pick<CoachClientsService, 'list'>;

  beforeEach(() => {
    service = {
      list: vi.fn().mockResolvedValue([
        {
          userId: 'u1',
          firstName: 'Ali',
          lastName: 'Valiyev',
          subscribedOnUtc: '2026-10-01T00:00:00Z',
          subscriptionEndsOnUtc: '2026-11-01T00:00:00Z',
        },
      ]),
    };
    TestBed.configureTestingModule({
      providers: [CoachClientsStore, { provide: CoachClientsService, useValue: service }],
    });
  });

  it('should expose active client summaries returned by the backend', async () => {
    const store = TestBed.inject(CoachClientsStore);

    await store.load();

    expect(store.clients().map((client) => client.userId)).toEqual(['u1']);
    expect(store.error()).toBeNull();
  });

  it('should clear client rows and expose an inaccessible response', async () => {
    vi.mocked(service.list).mockRejectedValue(new NotFoundError('Client is inaccessible.'));
    const store = TestBed.inject(CoachClientsStore);

    await store.load();

    expect(store.clients()).toEqual([]);
    expect(store.error()).toBe('errors.classes.notFound');
  });

  it('should filter visible clients by full name without calling the backend again', async () => {
    const store = TestBed.inject(CoachClientsStore);
    await store.load();

    store.query.set('  vali ');
    expect(store.visibleClients().map((client) => client.userId)).toEqual(['u1']);

    store.query.set('zzz');
    expect(store.visibleClients()).toEqual([]);
    expect(service.list).toHaveBeenCalledTimes(1);
  });
});
