import { AppLocale } from '@core/i18n/locale';
import { LocalizedText, pickLocalized } from '@shared/models/localized-text';

export interface ExerciseChoice {
  readonly id: string;
  readonly names: LocalizedText;
  readonly isActive: boolean;
}

export function sortByName(
  choices: readonly ExerciseChoice[],
  locale: AppLocale,
): readonly ExerciseChoice[] {
  return [...choices].sort((left, right) =>
    pickLocalized(left.names, locale).localeCompare(pickLocalized(right.names, locale), locale),
  );
}
