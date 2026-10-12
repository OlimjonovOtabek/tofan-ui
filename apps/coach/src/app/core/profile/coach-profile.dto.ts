export interface CoachProfileResponse {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  photoFileId: string | null;
  monthlyPrice: number;
  isPublished: boolean;
  createdOnUtc: string;
}

export interface UpdateCoachProfileRequest {
  displayName: string;
  bio: string | null;
  photoFileId: string | null;
  monthlyPrice: number;
}

export interface CoachProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  photoFileId: string | null;
  photoUrl: string | null;
  monthlyPrice: number;
  isPublished: boolean;
}
