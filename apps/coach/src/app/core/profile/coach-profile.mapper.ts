import {
  CoachProfile,
  CoachProfileChange,
  CoachProfileResponse,
  UpdateCoachProfileRequest,
} from './coach-profile.dto';

export function toCoachProfile(
  response: CoachProfileResponse,
  photoUrlOf: (fileId: string) => string,
): CoachProfile {
  return {
    id: response.id,
    userId: response.userId,
    displayName: response.displayName,
    slug: response.slug,
    bio: response.bio,
    photoFileId: response.photoFileId,
    photoUrl: response.photoFileId === null ? null : photoUrlOf(response.photoFileId),
    monthlyPrice: response.monthlyPrice,
    isPublished: response.isPublished,
  };
}

export function toCoachProfileChange(
  profile: CoachProfile,
  change: Partial<CoachProfileChange> = {},
): CoachProfileChange {
  return {
    displayName: profile.displayName,
    bio: profile.bio,
    photoFileId: profile.photoFileId,
    monthlyPrice: profile.monthlyPrice,
    ...change,
  };
}

export function toUpdateCoachProfileRequest(value: CoachProfileChange): UpdateCoachProfileRequest {
  const bio = value.bio?.trim() ?? '';
  const slug = value.slug?.trim() ?? '';
  return {
    displayName: value.displayName.trim(),
    ...(bio === '' ? {} : { bio }),
    ...(value.photoFileId === null ? {} : { photoFileId: value.photoFileId }),
    ...(value.monthlyPrice === null ? {} : { monthlyPrice: value.monthlyPrice }),
    ...(slug === '' ? {} : { slug }),
  };
}
