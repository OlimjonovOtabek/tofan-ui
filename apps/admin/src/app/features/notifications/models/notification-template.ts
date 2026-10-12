import { AppLocale } from '@core/i18n/locale';
import { LocalizedText, pickLocalized } from '@shared/models/localized-text';
import { NotificationType, TrainerStyle } from './notification-attributes';

export class NotificationTemplate {
  constructor(
    readonly id: string,
    readonly type: NotificationType,
    readonly trainerStyle: TrainerStyle,
    readonly titles: LocalizedText,
    readonly bodies: LocalizedText,
    readonly isActive: boolean,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  titleIn(locale: AppLocale): string {
    return pickLocalized(this.titles, locale);
  }

  bodyIn(locale: AppLocale): string {
    return pickLocalized(this.bodies, locale);
  }
}
