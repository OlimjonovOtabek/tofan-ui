import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { CoachProfile, CoachProfileChange, CoachProfileResponse } from './coach-profile.dto';
import { toCoachProfile, toUpdateCoachProfileRequest } from './coach-profile.mapper';

const PROFILE = '/coach/profile';
const FILES = '/files';

@Injectable({ providedIn: 'root' })
export class CoachProfileService {
  private readonly api = inject(ApiClient);

  async get(): Promise<CoachProfile> {
    const response = await this.api.get<CoachProfileResponse>(PROFILE);
    return toCoachProfile(response, (fileId) =>
      this.api.url(`${FILES}/${encodeURIComponent(fileId)}/content`),
    );
  }

  async update(change: CoachProfileChange): Promise<void> {
    await this.api.put(PROFILE, toUpdateCoachProfileRequest(change));
  }
}
