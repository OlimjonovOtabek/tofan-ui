export interface TrainerPostResponse {
  id: string;
  trainerId: string;
  trainerUserId: string;
  trainerDisplayName: string;
  trainerPhotoFileId: string | null;
  title: string;
  text: string | null;
  fileId: string | null;
  createdOnUtc: string;
  updatedOnUtc: string;
  videoUrl: string | null;
  hlsUrl: string | null;
  posterUrl: string | null;
}

export interface SaveTrainerPostRequest {
  title: string;
  text: string | null;
  fileId: string | null;
}
