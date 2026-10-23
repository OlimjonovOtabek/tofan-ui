import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { VideoDetailsResponse } from './video.dto';
import { VideoDetails } from './video';
import { toVideoDetails, toVideoIdsQuery } from './video.mapper';

const VIDEOS = '/files/videos';
const MAX_IDS_PER_READ = 100;

@Injectable({ providedIn: 'root' })
export class VideoStatusService {
  private readonly api = inject(ApiClient);

  async read(fileIds: readonly string[]): Promise<VideoDetails[]> {
    const details: VideoDetails[] = [];
    for (let start = 0; start < fileIds.length; start += MAX_IDS_PER_READ) {
      const ids = fileIds.slice(start, start + MAX_IDS_PER_READ);
      const responses = await this.api.get<VideoDetailsResponse[]>(
        `${VIDEOS}?${toVideoIdsQuery(ids)}`,
      );
      details.push(...responses.map(toVideoDetails));
    }
    return details;
  }

  urlOf(path: string | null | undefined): string | null {
    return path ? this.api.url(path) : null;
  }
}
