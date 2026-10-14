import { CoachProfileResponse } from './coach-profile.dto';
import { toCoachProfile, toUpdateCoachProfileRequest } from './coach-profile.mapper';

const response: CoachProfileResponse = {
  id: 't1',
  userId: 'u1',
  displayName: 'Coach One',
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
      monthlyPrice: 450000,
    });
  });

  it('should leave the photo URL empty when the profile has no photo', () => {
    expect(toCoachProfile({ ...response, photoFileId: null }, () => '/unused').photoUrl).toBeNull();
  });
});

describe('toUpdateCoachProfileRequest', () => {
  it('should trim profile text and convert a blank bio to null', () => {
    expect(
      toUpdateCoachProfileRequest({
        displayName: ' Coach One ',
        bio: '  ',
        photoFileId: null,
        monthlyPrice: 450000,
      }),
    ).toEqual({
      displayName: 'Coach One',
      bio: null,
      photoFileId: null,
      monthlyPrice: 450000,
    });
  });
});
