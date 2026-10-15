export interface TrainerResponse {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  photoFileId: string | null;
  monthlyPrice: number;
  isPublished: boolean;
  createdOnUtc: string;
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
}

export interface ChangeTrainerPasswordRequest {
  password: string;
}
