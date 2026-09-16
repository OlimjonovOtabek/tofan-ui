import { NotificationTemplate } from './entities/notification-template';
import {
  FALLBACK_TRAINER_STYLE,
  NotificationType,
  TRAINER_STYLES,
  TrainerStyle,
} from './notification-attributes';

export interface TemplateCoverage {
  /** Styles that have their own active template for the type. */
  readonly activeStyles: readonly TrainerStyle[];
  /**
   * True when every trainee gets a message: the backend uses the trainee's style and falls back
   * to the professional one, so an active professional template covers everybody.
   */
  readonly reachesEveryone: boolean;
}

export function templateCoverage(
  templates: readonly NotificationTemplate[],
  type: NotificationType,
): TemplateCoverage {
  const activeStyles = TRAINER_STYLES.filter((style) =>
    templates.some(
      (template) => template.isActive && template.type === type && template.trainerStyle === style,
    ),
  );
  return {
    activeStyles,
    reachesEveryone: activeStyles.includes(FALLBACK_TRAINER_STYLE),
  };
}
