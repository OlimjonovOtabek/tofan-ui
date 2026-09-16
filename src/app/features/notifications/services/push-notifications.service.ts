import { Injectable, inject } from '@angular/core';
import { CustomNotification, TemplatedNotification } from '../models/outgoing-notification';
import { ApiClient } from '@core/http/api-client';
import { toSendCustomRequest, toSendTemplatedRequest } from './notification.mapper';

@Injectable({ providedIn: 'root' })
export class PushNotificationsService {
  private readonly apiClient = inject(ApiClient);

  sendCustom(notification: CustomNotification): Promise<string> {
    return this.apiClient.post<string>('/notifications/custom', toSendCustomRequest(notification));
  }

  sendTemplated(notification: TemplatedNotification): Promise<string> {
    return this.apiClient.post<string>(
      '/notifications/templated',
      toSendTemplatedRequest(notification),
    );
  }
}
