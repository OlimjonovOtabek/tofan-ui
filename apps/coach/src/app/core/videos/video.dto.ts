export enum VideoStreamStatusDto {
  None = 0,
  Pending = 1,
  Ready = 2,
  Failed = 3,
}

export interface VideoDetailsResponse {
  fileId: string;
  streamStatus: VideoStreamStatusDto;
  durationSeconds: number | null;
  resumeAtSeconds: number;
  hlsUrl: string | null;
  posterUrl: string | null;
}
