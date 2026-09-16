import {
  CustomNotificationInput,
  createCustomNotification,
} from '@domain/notifications/outgoing-notification';
import { NotificationSender } from '@domain/notifications/repositories/notification-sender';

export class SendCustomNotificationUseCase {
  constructor(private readonly notificationSender: NotificationSender) {}

  /**
   * @returns id of the delivery record.
   * @throws ValidationError before anything is sent when the input is not sendable.
   */
  execute(input: CustomNotificationInput): Promise<string> {
    return this.notificationSender.sendCustom(createCustomNotification(input));
  }
}
