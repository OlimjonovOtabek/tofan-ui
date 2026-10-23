import { TestBed } from '@angular/core/testing';
import { Client } from '@coach/core/clients/client';
import { ClientsService } from '@coach/core/clients/clients.service';
import { NotificationService } from '@core/feedback/notification.service';
import { ClientsStore } from './clients.store';

const client = (userId: string, status: Client['status']): Client => ({
  userId,
  firstName: userId,
  lastName: '',
  goal: null,
  currentWeightKg: null,
  targetWeightKg: null,
  subscribedOn: null,
  subscriptionEndsOn: null,
  status,
  lastWorkoutOn: new Date(),
  adherencePercent: null,
});

describe('ClientsStore', () => {
  const list = vi.fn();
  const notifications = { error: vi.fn() };
  let store: ClientsStore;

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      providers: [
        ClientsStore,
        { provide: ClientsService, useValue: { list } },
        { provide: NotificationService, useValue: notifications },
      ],
    });
    store = TestBed.inject(ClientsStore);
  });

  it('should show active clients first and count every filter', async () => {
    list.mockResolvedValue([client('a', 'active'), client('b', 'ended'), client('c', 'expiring')]);

    await store.load();

    expect(store.visible().map((item) => item.userId)).toEqual(['a', 'c']);
    expect(store.counts()).toMatchObject({ all: 3, active: 2, expiring: 1, ended: 1 });
    store.filter.set('ended');
    expect(store.visible().map((item) => item.userId)).toEqual(['b']);
  });

  it('should keep the old list and toast when a refresh fails', async () => {
    list.mockResolvedValueOnce([client('a', 'active')]);
    await store.load();
    const failure = new Error('down');
    list.mockRejectedValueOnce(failure);

    await store.load();

    expect(store.clients()).toHaveLength(1);
    expect(store.loadError()).toBeNull();
    expect(notifications.error).toHaveBeenCalledWith(failure);
  });

  it('should keep a load error when the first load fails', async () => {
    list.mockRejectedValue(new Error('down'));

    await store.load();

    expect(store.clients()).toBeNull();
    expect(store.loadError()).not.toBeNull();
  });
});
