import { TierDto } from '@shared/models/tier.dto';
import { TrainerSubscriptionResponse } from './trainer-subscription.dto';
import {
  toChangeTierRequest,
  toGrantRequest,
  toSubscriptionQuery,
  toTrainerSubscription,
} from './trainer-subscription.mapper';

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
  tier: TierDto.Standard,
};

describe('toTrainerSubscription', () => {
  it('should map the dates and leave the end moment empty when it was not ended', () => {
    const subscription = toTrainerSubscription(response);

    expect(subscription.id).toBe('s1');
    expect(subscription.trainerDisplayName).toBe('Jasur Karimov');
    expect(subscription.startsOn).toEqual(new Date('2026-10-01T10:00:00Z'));
    expect(subscription.endsOn).toEqual(new Date('2026-11-01T10:00:00Z'));
    expect(subscription.endedOn).toBeNull();
  });

  it('should map the end moment when the subscription was ended', () => {
    const subscription = toTrainerSubscription({
      ...response,
      endedOnUtc: '2026-10-05T08:30:00Z',
    });

    expect(subscription.endedOn).toEqual(new Date('2026-10-05T08:30:00Z'));
  });
});

describe('toTrainerSubscription tier', () => {
  it('should read standard when the backend sends tier 1', () => {
    expect(toTrainerSubscription({ ...response, tier: TierDto.Standard }).tier).toBe('standard');
  });

  it('should read vip when the backend sends tier 2', () => {
    expect(toTrainerSubscription({ ...response, tier: TierDto.Vip }).tier).toBe('vip');
  });

  it('should fall back to standard when an older backend sends no tier', () => {
    const olderResponse: Partial<TrainerSubscriptionResponse> = { ...response };
    delete olderResponse.tier;

    expect(toTrainerSubscription(olderResponse as TrainerSubscriptionResponse).tier).toBe(
      'standard',
    );
  });
});

describe('toChangeTierRequest', () => {
  it('should send the backend integer for vip when the tier is vip', () => {
    expect(toChangeTierRequest('vip')).toEqual({ tier: 2 });
  });

  it('should send the backend integer for standard when the tier is standard', () => {
    expect(toChangeTierRequest('standard')).toEqual({ tier: 1 });
  });
});

describe('toGrantRequest', () => {
  it('should send the user id and the months when the request is built', () => {
    expect(toGrantRequest({ userId: 'u1', months: 3 })).toEqual({ userId: 'u1', months: 3 });
  });
});

describe('toSubscriptionQuery', () => {
  it('should drop everything when no filter is set', () => {
    expect(toSubscriptionQuery({})).toEqual({
      TrainerId: undefined,
      UserId: undefined,
      IsActive: undefined,
    });
  });

  it('should send the trainer and the user when they are set', () => {
    expect(toSubscriptionQuery({ trainerId: 't1', userId: 'u1' })).toMatchObject({
      TrainerId: 't1',
      UserId: 'u1',
    });
  });

  it('should ask for active subscriptions when the status is active', () => {
    expect(toSubscriptionQuery({ status: 'active' })).toMatchObject({ IsActive: true });
  });

  it('should ask for the closed subscriptions when the status is ended', () => {
    expect(toSubscriptionQuery({ status: 'ended' })).toMatchObject({ IsActive: false });
  });
});
