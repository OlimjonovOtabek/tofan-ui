import { CoachProfileResponse } from './coach-profile.dto';
import {
  toCoachProfile,
  toCoachProfileChange,
  toUpdateCoachProfileRequest,
} from './coach-profile.mapper';

const response: CoachProfileResponse = {
  id: 't1',
  userId: 'u1',
  displayName: 'Coach One',
  slug: 'coach-one',
  bio: null,
  photoFileId: 'f1',
  monthlyPrice: 450000,
  vipMonthlyPrice: null,
  isPublished: true,
  createdOnUtc: '2026-10-01T00:00:00Z',
};

describe('toCoachProfile', () => {
  it('should build a photo URL when the profile has a photo file', () => {
    expect(toCoachProfile(response, (id) => `/files/${id}`)).toMatchObject({
      id: 't1',
      photoUrl: '/files/f1',
      slug: 'coach-one',
      monthlyPrice: 450000,
      vipMonthlyPrice: null,
    });
  });

  it('should leave the photo URL empty when the profile has no photo', () => {
    expect(toCoachProfile({ ...response, photoFileId: null }, () => '/unused').photoUrl).toBeNull();
  });

  it('should keep the VIP price when the profile sells VIP', () => {
    expect(
      toCoachProfile({ ...response, vipMonthlyPrice: 800000 }, () => '/unused').vipMonthlyPrice,
    ).toBe(800000);
  });
});

describe('toUpdateCoachProfileRequest', () => {
  it('should trim text and leave out empty fields', () => {
    expect(
      toUpdateCoachProfileRequest({
        displayName: ' Coach One ',
        bio: '  ',
        photoFileId: null,
        monthlyPrice: 450000,
        vipMonthlyPrice: null,
        slug: '',
      }),
    ).toEqual({ displayName: 'Coach One', monthlyPrice: 450000, vipMonthlyPrice: null });
  });

  it('should always send the VIP price even when it is empty', () => {
    const body = toUpdateCoachProfileRequest({
      displayName: 'Coach One',
      bio: null,
      photoFileId: null,
      monthlyPrice: null,
      vipMonthlyPrice: null,
    });

    expect(body).toEqual({ displayName: 'Coach One', vipMonthlyPrice: null });
    expect(Object.keys(body)).toContain('vipMonthlyPrice');
  });

  it('should send the VIP price when it is set', () => {
    expect(
      toUpdateCoachProfileRequest({
        displayName: 'Coach One',
        bio: null,
        photoFileId: null,
        monthlyPrice: 450000,
        vipMonthlyPrice: 800000,
      }),
    ).toEqual({ displayName: 'Coach One', monthlyPrice: 450000, vipMonthlyPrice: 800000 });
  });

  it('should send the slug only when it is changed', () => {
    const profile = toCoachProfile(response, () => '/x');

    expect(toUpdateCoachProfileRequest(toCoachProfileChange(profile))).toEqual({
      displayName: 'Coach One',
      photoFileId: 'f1',
      monthlyPrice: 450000,
      vipMonthlyPrice: null,
    });
    expect(
      toUpdateCoachProfileRequest(toCoachProfileChange(profile, { slug: 'new-slug' })).slug,
    ).toBe('new-slug');
  });
});

describe('toCoachProfileChange', () => {
  const vipProfile = toCoachProfile({ ...response, vipMonthlyPrice: 800000 }, () => '/x');

  it('should pass the current VIP price through when the change leaves it out', () => {
    expect(toCoachProfileChange(vipProfile, { displayName: 'New Name' }).vipMonthlyPrice).toBe(
      800000,
    );
    expect(toCoachProfileChange(vipProfile, { bio: 'Bio' }).vipMonthlyPrice).toBe(800000);
    expect(toCoachProfileChange(vipProfile, { slug: 'new-slug' }).vipMonthlyPrice).toBe(800000);
    expect(toCoachProfileChange(vipProfile, { photoFileId: 'f2' }).vipMonthlyPrice).toBe(800000);
    expect(toCoachProfileChange(vipProfile, { monthlyPrice: 500000 }).vipMonthlyPrice).toBe(800000);
  });

  it('should let the change replace or clear the VIP price when the change names it', () => {
    expect(toCoachProfileChange(vipProfile, { vipMonthlyPrice: 900000 }).vipMonthlyPrice).toBe(
      900000,
    );
    expect(toCoachProfileChange(vipProfile, { vipMonthlyPrice: null }).vipMonthlyPrice).toBeNull();
  });
});
