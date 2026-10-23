import { enumMap } from '@shared/utils/enum-map';
import { VideoDetailsResponse, VideoStreamStatusDto } from './video.dto';
import { VideoDetails, VideoStreamStatus } from './video';

const streamStatuses = enumMap<VideoStreamStatus, VideoStreamStatusDto>(VideoStreamStatusDto);

export function toVideoDetails(response: VideoDetailsResponse): VideoDetails {
  return {
    fileId: response.fileId,
    status: streamStatuses.toDomainOrNull(response.streamStatus) ?? 'none',
    durationSeconds: response.durationSeconds,
  };
}

export function toVideoIdsQuery(fileIds: readonly string[]): string {
  return fileIds.map((id) => `ids=${encodeURIComponent(id)}`).join('&');
}
