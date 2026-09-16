import { CustomNotification, TemplatedNotification } from '../outgoing-notification';

/**
 * Port to the push pipeline. Both sends are recorded as a delivery on the backend, even when
 * they fail (no device, preference turned off, provider error), and reject with that reason.
 */
export abstract class NotificationSender {
  /** @returns id of the delivery record. */
  abstract sendCustom(notification: CustomNotification): Promise<string>;

  /** @returns id of the delivery record. */
  abstract sendTemplated(notification: TemplatedNotification): Promise<string>;
}
