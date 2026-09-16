import { NotificationTemplate } from './notification-template';
import {
  FALLBACK_TRAINER_STYLE,
  NotificationType,
  TRAINER_STYLES,
  TrainerStyle,
} from './notification-attributes';

export interface TemplateCoverage {
  readonly activeStyles: readonly TrainerStyle[];
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
