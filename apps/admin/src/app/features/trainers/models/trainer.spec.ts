import { Trainer } from './trainer';

function trainerWith(
  displayName: string,
  monthlyPrice: number,
  vipMonthlyPrice: number | null = null,
): Trainer {
  return new Trainer(
    '1',
    'u1',
    displayName,
    null,
    null,
    null,
    monthlyPrice,
    false,
    new Date('2026-10-02T09:00:00Z'),
    null,
    vipMonthlyPrice,
  );
}

describe('Trainer', () => {
  it('should have a price when the monthly price is above zero', () => {
    expect(trainerWith('Jasur Karimov', 450000).hasPrice()).toBe(true);
  });

  it('should have no price when the monthly price is zero', () => {
    expect(trainerWith('Jasur Karimov', 0).hasPrice()).toBe(false);
  });

  it('should sell VIP when the VIP price is above zero', () => {
    expect(trainerWith('Jasur Karimov', 450000, 900000).hasVipPrice()).toBe(true);
  });

  it('should not sell VIP when the VIP price is empty', () => {
    expect(trainerWith('Jasur Karimov', 450000, null).hasVipPrice()).toBe(false);
  });

  it('should show the stored VIP price when it is zero so the invalid value is not hidden', () => {
    expect(trainerWith('Jasur Karimov', 450000, 0).hasVipPrice()).toBe(true);
  });

  it('should take the first letters of the first two words when the name is long', () => {
    expect(trainerWith('jasur karimov ogli', 0).initials()).toBe('JK');
  });

  it('should take one letter when the name is one word', () => {
    expect(trainerWith('Jasur', 0).initials()).toBe('J');
  });

  it('should ignore extra spaces when the name is typed loosely', () => {
    expect(trainerWith('  Jasur   Karimov ', 0).initials()).toBe('JK');
  });

  it('should list the email and the phone when the account has both', () => {
    const trainer = new Trainer(
      '1',
      'u1',
      'Stage Coach',
      null,
      null,
      null,
      450000,
      true,
      new Date('2026-10-02T09:00:00Z'),
      'stage-coach',
      null,
      {
        userName: 'stage-coach',
        email: 'stage-coach@example.test',
        phoneNumber: '+998901234567',
        activeSubscribersCount: 4,
      },
    );

    expect(trainer.contacts()).toEqual(['stage-coach@example.test', '+998901234567']);
  });

  it('should list no contact when the account details are missing', () => {
    expect(trainerWith('Jasur Karimov', 450000).contacts()).toEqual([]);
  });
});
