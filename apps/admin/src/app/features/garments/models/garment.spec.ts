import { Garment } from './garment';
import { GarmentStatus } from './garment-status';

function garment(
  status: GarmentStatus,
  ownerId: string | null = null,
  expiresAt: Date | null = null,
): Garment {
  return new Garment(
    '1',
    'n1gq9Xh2',
    '01K7X8M4Q9F2A6BC3DEFGHJKMN',
    'd1',
    'Drop 1',
    349,
    'Oversize',
    '#1A3C6E',
    'L',
    '95% paxta',
    new Date('2026-08-14T00:00:00Z'),
    status,
    ownerId,
    ownerId === null ? null : new Date('2026-09-21T10:12:00Z'),
    expiresAt,
  );
}

describe('Garment', () => {
  const now = new Date('2026-11-21T10:12:00Z');

  it('should be expired when the validity ended before now', () => {
    expect(garment('active', 'u1', new Date('2026-11-21T10:11:59Z')).isExpired(now)).toBe(true);
  });

  it('should not be expired when the validity ends later or is missing', () => {
    expect(garment('active', 'u1', new Date('2026-11-21T10:12:00Z')).isExpired(now)).toBe(false);
    expect(garment('inactive').isExpired(now)).toBe(false);
  });

  it('should allow extending only when an owner activated it', () => {
    expect(garment('active', 'u1').canExtend()).toBe(true);
    expect(garment('inactive').canExtend()).toBe(false);
  });

  it('should allow deleting only when nobody activated it', () => {
    expect(garment('inactive').canDelete()).toBe(true);
    expect(garment('revoked').canDelete()).toBe(true);
    expect(garment('revoked', 'u1').canDelete()).toBe(false);
  });

  it('should offer hiding and revoking when the garment is visible', () => {
    expect(garment('inactive').statusChanges()).toEqual(['hidden', 'revoked']);
    expect(garment('active', 'u1').statusChanges()).toEqual(['hidden', 'revoked']);
  });

  it('should offer restoring when the garment is hidden or revoked', () => {
    expect(garment('hidden').statusChanges()).toEqual(['active', 'revoked']);
    expect(garment('revoked').statusChanges()).toEqual(['active', 'hidden']);
  });

  it('should have no owner when nobody activated the garment', () => {
    expect(garment('inactive').owner()).toBeNull();
  });

  it('should name the owner when the list sends the owner names', () => {
    const owned = new Garment(
      '1',
      'n1gq9Xh2',
      '01K7X8M4Q9F2A6BC3DEFGHJKMN',
      'd1',
      'Drop 1',
      349,
      'Oversize',
      '#1A3C6E',
      'L',
      '95% paxta',
      new Date('2026-08-14T00:00:00Z'),
      'active',
      '3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b',
      new Date('2026-09-21T10:12:00Z'),
      null,
      'Otabek Olimjonov',
      'otabek',
    );

    expect(owned.owner()).toEqual({
      primary: 'Otabek Olimjonov',
      secondary: 'otabek',
      isIdFallback: false,
    });
  });

  it('should fall back to the short owner id when the owner has no profile', () => {
    expect(garment('active', '3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b').owner()?.primary).toBe(
      '3f2b8c1e',
    );
  });
});
