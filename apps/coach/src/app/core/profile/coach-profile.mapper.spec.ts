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
    });
  });

  it('should leave the photo URL empty when the profile has no photo', () => {
    expect(toCoachProfile({ ...response, photoFileId: null }, () => '/unused').photoUrl).toBeNull();
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
        slug: '',
      }),
    ).toEqual({ displayName: 'Coach One', monthlyPrice: 450000 });
  });

  it('should send the slug only when it is changed', () => {
    const profile = toCoachProfile(response, () => '/x');

    expect(toUpdateCoachProfileRequest(toCoachProfileChange(profile))).toEqual({
      displayName: 'Coach One',
      photoFileId: 'f1',
      monthlyPrice: 450000,
    });
    expect(
      toUpdateCoachProfileRequest(toCoachProfileChange(profile, { slug: 'new-slug' })).slug,
    ).toBe('new-slug');
  });
});
