import { NotificationTemplate } from '@domain/notifications/entities/notification-template';
import { NotificationType, TrainerStyle } from '@domain/notifications/notification-attributes';
import { NotificationTemplateDraft } from '@domain/notifications/notification-template-draft';
import {
  CustomNotification,
  TemplatedNotification,
} from '@domain/notifications/outgoing-notification';
import { enumMap } from '@infrastructure/api/enum-map';
import {
  CreateNotificationTemplateRequest,
  NotificationTemplateResponse,
  NotificationType as ApiNotificationType,
  SendCustomNotificationRequest,
  SendTemplatedNotificationRequest,
  TrainerStyle as ApiTrainerStyle,
} from '@infrastructure/api/generated';

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
    response.title,
    response.titleUz,
    response.titleRu,
    response.body,
    response.bodyUz,
    response.bodyRu,
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
