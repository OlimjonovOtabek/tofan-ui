import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { CoachProfile, CoachProfileResponse, UpdateCoachProfileRequest } from './coach-profile.dto';
import { toCoachProfile, toUpdateCoachProfileRequest } from './coach-profile.mapper';

const FILES = '/files';

@Injectable({ providedIn: 'root' })
export class CoachProfileService {
  private readonly api = inject(ApiClient);

  async get(): Promise<CoachProfile> {
    const response = await this.api.get<CoachProfileResponse>('/coach/profile');
    return toCoachProfile(response, (fileId) => this.api.url(`${FILES}/${encodeURIComponent(fileId)}/content`));
  }

  async update(request: UpdateCoachProfileRequest): Promise<void> {
    await this.api.put('/coach/profile', toUpdateCoachProfileRequest(request));
  }
}
