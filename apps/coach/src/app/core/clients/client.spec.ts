import { ClientSubscriptionStatusDto } from './client.dto';
import {
  Client,
  adherenceLevel,
  countClients,
  daysLeft,
  filterClients,
  fullNameOf,
  isLowActivity,
  needsReview,
} from './client';
import { toClient } from './client.mapper';

const now = new Date(2026, 9, 22, 12, 0);
const base: Client = {
  userId: 'u',
  firstName: 'Aziz',
  lastName: 'Karimov',
  goal: null,
  currentWeightKg: null,
  targetWeightKg: null,
  subscribedOn: null,
  subscriptionEndsOn: new Date(2026, 9, 25, 12, 0),
  status: 'active',
  lastWorkoutOn: new Date(2026, 9, 21),
  adherencePercent: 90,
};
const client = (change: Partial<Client>): Client => ({ ...base, ...change });

describe('adherenceLevel', () => {
  it('should grade by the 85 and 70 thresholds', () => {
    expect([90, 85, 75, 70, 40].map(adherenceLevel)).toEqual([
      'high',
      'high',
      'good',
      'good',
      'low',
    ]);
    expect(adherenceLevel(null)).toBeNull();
  });

  it('should ask for review only when adherence is low', () => {
    expect(needsReview(client({ adherencePercent: 50 }))).toBe(true);
    expect(needsReview(client({ adherencePercent: null }))).toBe(false);
  });
});

describe('daysLeft', () => {
  it('should round up to whole days and stop at zero', () => {
    expect(daysLeft(base, now)).toBe(3);
    expect(daysLeft(client({ subscriptionEndsOn: new Date(2026, 9, 20) }), now)).toBe(0);
    expect(daysLeft(client({ subscriptionEndsOn: null }), now)).toBeNull();
  });
});

describe('isLowActivity', () => {
  it('should flag clients without a workout for a week and never flag ended ones', () => {
    expect(isLowActivity(client({ lastWorkoutOn: new Date(2026, 9, 10) }), now)).toBe(true);
    expect(isLowActivity(client({ lastWorkoutOn: null }), now)).toBe(true);
    expect(isLowActivity(base, now)).toBe(false);
    expect(isLowActivity(client({ status: 'ended', lastWorkoutOn: null }), now)).toBe(false);
  });
});

describe('filterClients', () => {
  const clients = [
    client({ userId: '1', firstName: 'Aziz' }),
    client({ userId: '2', firstName: 'Bobur', status: 'expiring' }),
    client({ userId: '3', firstName: 'Dilnoza', status: 'ended' }),
    client({ userId: '4', firstName: 'Lola', lastWorkoutOn: new Date(2026, 9, 1) }),
    client({ userId: '5', firstName: 'Nodir', lastWorkoutOn: null }),
  ];

  it('should keep the active ones and count by filter', () => {
    expect(filterClients(clients, 'active', '', now).map((item) => item.userId)).toEqual([
      '1',
      '2',
      '4',
      '5',
    ]);
    expect(countClients(clients, 'ended', now)).toBe(1);
    expect(countClients(clients, 'all', now)).toBe(5);
  });

  it('should search by name and sort low activity from the longest silence', () => {
    expect(filterClients(clients, 'all', ' boBur ', now).map((item) => item.userId)).toEqual(['2']);
    expect(filterClients(clients, 'lowActivity', '', now).map((item) => item.userId)).toEqual([
      '5',
      '4',
    ]);
  });
});

describe('toClient', () => {
  it('should map the status and trim nothing but keep names', () => {
    const mapped = toClient(
      {
        userId: 'u',
        firstName: 'A',
        lastName: 'B',
        goal: null,
        currentWeightKg: 70,
        targetWeightKg: null,
        subscribedOnUtc: null,
        subscriptionEndsOnUtc: '2026-10-25T00:00:00Z',
        status: ClientSubscriptionStatusDto.Expiring,
        lastWorkoutOnUtc: null,
      },
      80,
    );

    expect(mapped.status).toBe('expiring');
    expect(mapped.adherencePercent).toBe(80);
    expect(fullNameOf(mapped)).toBe('A B');
  });
});
