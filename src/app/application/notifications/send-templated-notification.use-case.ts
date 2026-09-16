import {
  TemplatedNotificationInput,
  createTemplatedNotification,
} from '@domain/notifications/outgoing-notification';
import { NotificationSender } from '@domain/notifications/repositories/notification-sender';

export class SendTemplatedNotificationUseCase {
  constructor(private readonly notificationSender: NotificationSender) {}

  /**
   * @returns id of the delivery record.
   * @throws ValidationError before anything is sent when the input is not sendable.
   */
  execute(input: TemplatedNotificationInput): Promise<string> {
    return this.notificationSender.sendTemplated(createTemplatedNotification(input));
  }
}
