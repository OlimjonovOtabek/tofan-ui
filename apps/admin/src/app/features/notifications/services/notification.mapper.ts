import { NotificationTemplate } from '../models/notification-template';
import { NotificationType, TrainerStyle } from '../models/notification-attributes';
import { NotificationTemplateDraft } from '../models/notification-template-draft';
import { CustomNotification, TemplatedNotification } from '../models/outgoing-notification';
import { enumMap } from '@shared/utils/enum-map';
import {
  CreateNotificationTemplateRequest,
  NotificationTemplateResponse,
  NotificationType as ApiNotificationType,
  SendCustomNotificationRequest,
  SendTemplatedNotificationRequest,
  TrainerStyle as ApiTrainerStyle,
} from './notification.dto';

export const notificationTypes = enumMap<NotificationType, ApiNotificationType>(
  ApiNotificationType,
);
export const trainerStyles = enumMap<TrainerStyle, ApiTrainerStyle>(ApiTrainerStyle);

export function toNotificationTemplate(
  response: NotificationTemplateResponse,
): NotificationTemplate {
  return new NotificationTemplate(
    response.id,
    notificationTypes.toDomain(response.type),
    trainerStyles.toDomain(response.trainerStyle),
    { en: response.title, uz: response.titleUz, ru: response.titleRu },
    { en: response.body, uz: response.bodyUz, ru: response.bodyRu },
    response.isActive,
    new Date(response.createdOnUtc),
    new Date(response.updatedOnUtc),
  );
}

export function toNotificationTemplateRequest(
  draft: NotificationTemplateDraft,
): CreateNotificationTemplateRequest {
  return {
    type: notificationTypes.toApi(draft.type),
    trainerStyle: trainerStyles.toApi(draft.trainerStyle),
    title: draft.title,
    titleUz: draft.titleUz,
    titleRu: draft.titleRu,
    body: draft.body,
    bodyUz: draft.bodyUz,
    bodyRu: draft.bodyRu,
    isActive: draft.isActive,
  };
}

export function toSendCustomRequest(
  notification: CustomNotification,
): SendCustomNotificationRequest {
  return {
    userId: notification.userId,
    type: notificationTypes.toApi(notification.type),
    title: notification.title,
    body: notification.body,
    ...(notification.data === null ? {} : { data: { ...notification.data } }),
  };
}

export function toSendTemplatedRequest(
  notification: TemplatedNotification,
): SendTemplatedNotificationRequest {
  return {
    userId: notification.userId,
    type: notificationTypes.toApi(notification.type),
    ...(notification.data === null ? {} : { data: { ...notification.data } }),
  };
}
