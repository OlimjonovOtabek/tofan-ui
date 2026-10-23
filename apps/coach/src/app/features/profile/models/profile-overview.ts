import { CoachProfile } from '@coach/core/profile/coach-profile.dto';

export interface ProfileOverview {
  readonly profile: CoachProfile;
  readonly clientCount: number | null;
  readonly averageAdherence: number | null;
  readonly publishedWorkoutPrograms: number | null;
  readonly publishedMealPrograms: number | null;
}

export function monthlyRevenue(overview: ProfileOverview): number | null {
  const price = overview.profile.monthlyPrice;
  return price === null || overview.clientCount === null ? null : price * overview.clientCount;
}

export function publishedPrograms(overview: ProfileOverview): number | null {
  const { publishedWorkoutPrograms: workout, publishedMealPrograms: meal } = overview;
  return workout === null || meal === null ? null : workout + meal;
}

export function averageOf(percents: readonly (number | null)[]): number | null {
  const known = percents.filter((percent): percent is number => percent !== null);
  return known.length === 0
    ? null
    : Math.round(known.reduce((sum, percent) => sum + percent, 0) / known.length);
}

const SLUG = /^(?!-)(?!.*--)[a-z0-9-]{3,30}(?<!-)$/;
const GENERATED_SLUG = /^trainer(-\d+)?$/;
export const BIO_MAX = 500;

export function isValidSlug(slug: string): boolean {
  const value = slug.trim();
  return value === '' || SLUG.test(value);
}

export function isGeneratedSlug(slug: string): boolean {
  return GENERATED_SLUG.test(slug);
}
