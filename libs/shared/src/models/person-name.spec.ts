import { toPersonName } from './person-name';

const ID = '3f2a9c1e-1111-4222-8333-444455556666';

describe('toPersonName', () => {
  it('should show the full name with the username under it when both exist', () => {
    expect(toPersonName('Otabek Olimjonov', 'otabek', ID)).toEqual({
      primary: 'Otabek Olimjonov',
      secondary: 'otabek',
      isIdFallback: false,
    });
  });

  it('should show the username alone when the full name is missing', () => {
    expect(toPersonName(null, 'stage-coach', ID)).toEqual({
      primary: 'stage-coach',
      secondary: null,
      isIdFallback: false,
    });
  });

  it('should fall back to the short id when the user has no profile', () => {
    expect(toPersonName(null, null, ID)).toEqual({
      primary: '3f2a9c1e',
      secondary: null,
      isIdFallback: true,
    });
  });

  it('should ignore blank names when they only hold spaces', () => {
    expect(toPersonName('  ', ' ', ID).isIdFallback).toBe(true);
  });
});
