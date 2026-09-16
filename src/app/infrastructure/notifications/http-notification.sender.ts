import { Injectable, inject } from '@angular/core';
import {
  CustomNotification,
  TemplatedNotification,
} from '@domain/notifications/outgoing-notification';
import { NotificationSender } from '@domain/notifications/repositories/notification-sender';
import { ApiClient } from '@infrastructure/api/api-client';
import { postNotificationsCustom, postNotificationsTemplated } from '@infrastructure/api/generated';
import { toSendCustomRequest, toSendTemplatedRequest } from './notification.mapper';

@Injectable()
export class HttpNotificationSender implements NotificationSender {
  private readonly apiClient = inject(ApiClient);

  sendCustom(notification: CustomNotification): Promise<string> {
    return this.apiClient.invoke(postNotificationsCustom, {
      body: toSendCustomRequest(notification),
    });
  }

  sendTemplated(notification: TemplatedNotification): Promise<string> {
    return this.apiClient.invoke(postNotificationsTemplated, {
      body: toSendTemplatedRequest(notification),
    });
  }
}
