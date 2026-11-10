export interface TrainerSummaryResponse {
  id: string;
  userId: string;
  displayName: string;
  slug?: string | null;
  bio: string | null;
  photoFileId: string | null;
  monthlyPrice: number;
  vipMonthlyPrice?: number | null;
  isPublished: boolean;
  createdOnUtc: string;
  activeSubscribersCount?: number;
  userName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
}

export interface CreateTrainerRequest {
  username: string;
  email: string;
  phoneNumber: string | null;
  password: string;
  displayName: string;
  bio: string | null;
  photoFileId: string | null;
}

export interface UpdateTrainerRequest {
  email: string;
  phoneNumber: string | null;
  displayName: string;
  bio: string | null;
  photoFileId: string | null;
  monthlyPrice: number;
  vipMonthlyPrice: number | null;
}

export interface ChangeTrainerPasswordRequest {
  password: string;
}
