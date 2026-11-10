export interface TrainerVideoCollectionResponse {
  id: string;
  title: string;
  description: string | null;
  isPublished: boolean;
  displayOrder: number;
  videoCount: number;
  createdOnUtc: string;
}

export interface CollectionVideoResponse {
  id: string;
  fileId: string;
  title: string | null;
  note: string | null;
  displayOrder: number;
  videoUrl: string | null;
  hlsUrl: string | null;
  posterUrl: string | null;
}

export interface TrainerVideoCollectionDetailResponse {
  id: string;
  title: string;
  description: string | null;
  isPublished: boolean;
  createdOnUtc: string;
  videos: CollectionVideoResponse[];
}

export interface SaveVideoCollectionRequest {
  title: string;
  description: string | null;
}

export interface AddCollectionVideoRequest {
  fileId: string;
  title: string | null;
  note: string | null;
}

export interface UpdateCollectionVideoRequest {
  title: string | null;
  note: string | null;
}
