import { TestBed } from '@angular/core/testing';
import { Client } from '@coach/core/clients/client';
import { ClientDetailStore } from './client-detail.store';
import { ClientDetailService } from './services/client-detail.service';

const client = (status: Client['status']): Client => ({
  userId: 'u',
  firstName: 'A',
  lastName: 'B',
  goal: null,
  currentWeightKg: null,
  targetWeightKg: null,
  subscribedOn: null,
  subscriptionEndsOn: null,
  status,
  lastWorkoutOn: null,
  adherencePercent: null,
});

describe('ClientDetailStore', () => {
  const service = {
    findClient: vi.fn(),
    profile: vi.fn(),
    payments: vi.fn(),
    adherence: vi.fn(),
    recentSessions: vi.fn(),
    todayNutrition: vi.fn(),
  };
  let store: ClientDetailStore;

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      providers: [ClientDetailStore, { provide: ClientDetailService, useValue: service }],
    });
    store = TestBed.inject(ClientDetailStore);
    service.profile.mockResolvedValue({ firstName: 'A' });
    service.payments.mockResolvedValue([]);
    service.adherence.mockResolvedValue({
      scheduledDays: 4,
      completedDays: 3,
      missedDays: 1,
      percent: 75,
    });
    service.recentSessions.mockResolvedValue([]);
    service.todayNutrition.mockResolvedValue(null);
  });

  it('should load every section and copy the adherence onto the client', async () => {
    service.findClient.mockResolvedValue(client('active'));

    await store.load('u');

    expect(store.detail()?.client.adherencePercent).toBe(75);
    expect(store.detail()?.nutritionLoaded).toBe(true);
  });

  it('should skip activity sections when the subscription ended', async () => {
    service.findClient.mockResolvedValue(client('ended'));

    await store.load('u');

    expect(service.adherence).not.toHaveBeenCalled();
    expect(store.detail()?.sessions).toBeNull();
    expect(store.detail()?.payments).toEqual([]);
  });

  it('should keep one section empty and the rest when only that request fails', async () => {
    service.findClient.mockResolvedValue(client('active'));
    service.recentSessions.mockRejectedValue(new Error('x'));

    await store.load('u');

    expect(store.detail()?.sessions).toBeNull();
    expect(store.detail()?.adherence).not.toBeNull();
  });

  it('should fail when the client is not in the list', async () => {
    service.findClient.mockResolvedValue(null);

    await store.load('u');

    expect(store.detail()).toBeNull();
    expect(store.loadError()).not.toBeNull();
  });
});
