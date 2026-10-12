import { CoachProfile, CoachProfileResponse, UpdateCoachProfileRequest } from './coach-profile.dto';

export function toCoachProfile(response: CoachProfileResponse, photoUrlOf: (fileId: string) => string): CoachProfile {
  return {
    id: response.id,
    userId: response.userId,
    displayName: response.displayName,
    bio: response.bio,
    photoFileId: response.photoFileId,
    photoUrl: response.photoFileId === null ? null : photoUrlOf(response.photoFileId),
    monthlyPrice: response.monthlyPrice,
    isPublished: response.isPublished,
  };
}

export function toUpdateCoachProfileRequest(value: UpdateCoachProfileRequest): UpdateCoachProfileRequest {
  return {
    displayName: value.displayName.trim(),
    bio: value.bio?.trim() || null,
    photoFileId: value.photoFileId,
    monthlyPrice: value.monthlyPrice,
  };
}
