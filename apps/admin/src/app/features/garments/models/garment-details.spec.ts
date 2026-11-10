import { Garment } from './garment';
import { garmentDetails } from './garment-details';

function garment(ownerId: string | null, material: string): Garment {
  return new Garment(
    'f3a1',
    'n1gq9Xh2',
    '01K7X8M4Q9F2A6BC3DEFGHJKMN',
    'd1',
    'Drop 1',
    349,
    'Oversize',
    '#1A3C6E',
    'L',
    material,
    new Date(2026, 8, 20),
    ownerId === null ? 'inactive' : 'active',
    ownerId,
    ownerId === null ? null : new Date('2026-09-21T10:12:00Z'),
    ownerId === null ? null : new Date('2026-11-21T10:12:00Z'),
  );
}

function valueOf(details: ReturnType<typeof garmentDetails>, label: string): unknown {
  return details.find((detail) => detail.label === label)?.value;
}

describe('garmentDetails', () => {
  it('should list every field of the row when the garment is claimed', () => {
    const details = garmentDetails(garment('u1', '95% paxta'));

    expect(details.map((detail) => detail.label)).toEqual([
      'garments.fields.serialNumber',
      'garments.fields.token',
      'garments.fields.drop',
      'garments.fields.edition',
      'garments.fields.variant',
      'garments.fields.color',
      'garments.fields.size',
      'garments.fields.material',
      'garments.fields.manufacturedAt',
      'garments.fields.activatedAt',
      'garments.fields.expiresAt',
      'garments.fields.owner',
      'garments.fields.ownerId',
      'garments.fields.id',
    ]);
    expect(valueOf(details, 'garments.fields.ownerId')).toBe('u1');
    expect(valueOf(details, 'garments.fields.edition')).toBe('349');
    expect(valueOf(details, 'garments.fields.expiresAt')).toEqual(new Date('2026-11-21T10:12:00Z'));
  });

  it('should leave the owner fields and a blank material empty when nobody activated it', () => {
    const details = garmentDetails(garment(null, '  '));

    expect(valueOf(details, 'garments.fields.ownerId')).toBeNull();
    expect(valueOf(details, 'garments.fields.owner')).toBeNull();
    expect(valueOf(details, 'garments.fields.activatedAt')).toBeNull();
    expect(valueOf(details, 'garments.fields.material')).toBeNull();
  });

  it('should show the owner name with the username when the owner has a profile', () => {
    const owned = garment('u1', '95% paxta');
    const named = new Garment(
      owned.id,
      owned.token,
      owned.serialNumber,
      owned.dropId,
      owned.dropName,
      owned.editionNumber,
      owned.variantName,
      owned.color,
      owned.size,
      owned.material,
      owned.manufacturedAt,
      owned.status,
      owned.ownerId,
      owned.activatedAt,
      owned.expiresAt,
      'Otabek Olimjonov',
      'otabek',
    );

    expect(valueOf(garmentDetails(named), 'garments.fields.owner')).toBe(
      'Otabek Olimjonov (otabek)',
    );
  });

  it('should leave the owner name empty when only the owner id is known', () => {
    expect(valueOf(garmentDetails(garment('u1', '95% paxta')), 'garments.fields.owner')).toBeNull();
  });
});
