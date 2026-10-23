export interface CoachProfileResponse {
  id: string;
  userId: string;
  displayName: string;
  slug: string | null;
  bio: string | null;
  photoFileId: string | null;
  monthlyPrice: number | null;
  isPublished: boolean;
  createdOnUtc: string;
}

export interface UpdateCoachProfileRequest {
  displayName: string;
  bio?: string;
  photoFileId?: string;
  monthlyPrice?: number;
  slug?: string;
}

export interface CoachProfile {
  id: string;
  userId: string;
  displayName: string;
  slug: string | null;
  bio: string | null;
  photoFileId: string | null;
  photoUrl: string | null;
  monthlyPrice: number | null;
  isPublished: boolean;
}

export interface CoachProfileChange {
  displayName: string;
  bio: string | null;
  photoFileId: string | null;
  monthlyPrice: number | null;
  slug?: string | null;
}
