import { initialsOf } from '@coach/core/clients/client-activity';
import { formatMoneyShort } from '@coach/core/format/formats';
import { TRAINER_PAGE_URL } from '@coach/core/layout/coach-links';
import { CoachProfile } from '@coach/core/profile/coach-profile.dto';
import { TranslationKey, TranslationParams } from '@core/i18n/dictionary';
import { AppLocale } from '@core/i18n/locale';
import {
  ProfileOverview,
  isGeneratedSlug,
  monthlyRevenue,
  publishedPrograms,
} from './profile-overview';

export type ProfileTranslate = (key: TranslationKey, params?: TranslationParams) => string;

export interface ProfileView {
  readonly profile: CoachProfile;
  readonly initials: string;
  readonly link: string | null;
  readonly generated: boolean;
  readonly clients: string;
  readonly revenue: string;
  readonly adherence: string;
  readonly programs: string;
  readonly split: string | null;
}

export function toProfileView(
  overview: ProfileOverview,
  locale: AppLocale,
  translate: ProfileTranslate,
): ProfileView {
  const unknown = translate('coachApp.common.unknown');
  const { profile } = overview;
  const revenue = monthlyRevenue(overview);
  const programs = publishedPrograms(overview);
  return {
    profile,
    initials: initialsOfName(profile.displayName),
    link: profile.slug ? `${TRAINER_PAGE_URL}${profile.slug}` : null,
    generated: profile.slug !== null && isGeneratedSlug(profile.slug),
    clients: overview.clientCount === null ? unknown : String(overview.clientCount),
    revenue: revenue === null ? unknown : formatMoneyShort(revenue, locale),
    adherence: overview.averageAdherence === null ? unknown : String(overview.averageAdherence),
    programs: programs === null ? unknown : String(programs),
    split:
      programs === null
        ? null
        : translate('coachApp.profile.programsSplit', {
            workout: overview.publishedWorkoutPrograms ?? 0,
            meal: overview.publishedMealPrograms ?? 0,
          }),
  };
}

function initialsOfName(displayName: string): string {
  const words = displayName.trim().split(/\s+/);
  return initialsOf(words[0], words.length > 1 ? words[words.length - 1] : null);
}
