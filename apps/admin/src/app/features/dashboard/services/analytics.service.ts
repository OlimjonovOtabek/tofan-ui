import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { AnalyticsApp } from '../models/analytics-app';
import { DateSpan } from '../models/analytics-period';
import { Audience } from '../models/audience';
import { Engagement } from '../models/engagement';
import { Reach } from '../models/reach';
import { Realtime } from '../models/realtime';
import { Cohort } from '../models/retention';
import { audienceRequests, toAudience } from './audience.mapper';
import { engagementRequests, toEngagement } from './engagement.mapper';
import { Ga4BatchResponse, Ga4Report, Ga4ReportRequest } from './ga4.dto';
import { reachRequests, toReach } from './reach.mapper';
import { realtimeMinutesRequest, realtimePlatformsRequest, toRealtime } from './realtime.mapper';
import { retentionRequest, toCohorts } from './retention.mapper';

const BATCH_REPORTS = '/ga4/batchRunReports';
const REPORT = '/ga4/runReport';
const REALTIME_REPORT = '/ga4/runRealtimeReport';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly apiClient = inject(ApiClient);

  async audience(app: AnalyticsApp, span: DateSpan): Promise<Audience> {
    return toAudience(await this.batch(audienceRequests(app, span)), span);
  }

  async reach(app: AnalyticsApp, span: DateSpan): Promise<Reach> {
    return toReach(await this.batch(reachRequests(app, span)));
  }

  async engagement(app: AnalyticsApp, span: DateSpan): Promise<Engagement> {
    return toEngagement(await this.batch(engagementRequests(app, span)));
  }

  async retention(app: AnalyticsApp, weeks: readonly DateSpan[]): Promise<readonly Cohort[]> {
    const report = await this.apiClient.post<Ga4Report>(REPORT, retentionRequest(app, weeks));
    return toCohorts(report, weeks);
  }

  async realtime(app: AnalyticsApp): Promise<Realtime> {
    const [platforms, minutes] = await Promise.all([
      this.apiClient.post<Ga4Report>(REALTIME_REPORT, realtimePlatformsRequest(app)),
      this.apiClient.post<Ga4Report>(REALTIME_REPORT, realtimeMinutesRequest(app)),
    ]);
    return toRealtime(platforms, minutes);
  }

  private async batch(requests: readonly Ga4ReportRequest[]): Promise<readonly Ga4Report[]> {
    const response = await this.apiClient.post<Ga4BatchResponse>(BATCH_REPORTS, { requests });
    return response.reports ?? [];
  }
}
