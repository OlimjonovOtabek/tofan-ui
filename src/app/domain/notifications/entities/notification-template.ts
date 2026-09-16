import { NotificationType, TrainerStyle } from '../notification-attributes';

/**
 * Wording of one notification type in one trainer style, in three languages. The backend picks
 * the language from the trainee's preferences when it sends.
 */
export class NotificationTemplate {
  constructor(
    readonly id: string,
    readonly type: NotificationType,
    readonly trainerStyle: TrainerStyle,
    readonly title: string,
    readonly titleUz: string,
    readonly titleRu: string,
    readonly body: string,
    readonly bodyUz: string,
    readonly bodyRu: string,
    readonly isActive: boolean,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  /** What the panel shows in lists: the Uzbek title when it exists. */
  get displayTitle(): string {
    return this.titleUz.length > 0 ? this.titleUz : this.title;
  }

  get displayBody(): string {
    return this.bodyUz.length > 0 ? this.bodyUz : this.body;
  }
}
