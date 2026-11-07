import { CoachProfile } from '@coach/core/profile/coach-profile.dto';
import { translate } from '@core/i18n/translate';
import { ProfileOverview } from './profile-overview';
import { toProfileView } from './profile-view';

const profile: CoachProfile = {
  id: 'p1',
  userId: 'u1',
  displayName: 'Aziz Karimov Jr',
  slug: 'aziz-fit',
  bio: null,
  photoFileId: null,
  photoUrl: null,
  monthlyPrice: 450000,
  vipMonthlyPrice: null,
  isPublished: true,
};

const overview: ProfileOverview = {
  profile,
  clientCount: 4,
  averageAdherence: 76,
  publishedWorkoutPrograms: 1,
  publishedMealPrograms: 2,
};

function viewOf(source: ProfileOverview) {
  return toProfileView(source, 'en', (key, params) => translate('en', key, params));
}

describe('profile view', () => {
  it('should show the stats and the public link when the overview is complete', () => {
    const view = viewOf(overview);

    expect(view.initials).toBe('AJ');
    expect(view.link).toBe('https://peaktofan.com/t/aziz-fit');
    expect(view.generated).toBe(false);
    expect(view.clients).toBe('4');
    expect(view.adherence).toBe('76');
    expect(view.programs).toBe('3');
    expect(view.split).toBe('1 workout · 2 meal');
  });

  it('should show the unknown mark when a stat is missing', () => {
    const view = viewOf({
      ...overview,
      clientCount: null,
      averageAdherence: null,
      publishedMealPrograms: null,
    });

    expect(view.clients).toBe(translate('en', 'coachApp.common.unknown'));
    expect(view.adherence).toBe(translate('en', 'coachApp.common.unknown'));
    expect(view.revenue).toBe(translate('en', 'coachApp.common.unknown'));
    expect(view.programs).toBe(translate('en', 'coachApp.common.unknown'));
    expect(view.split).toBeNull();
  });

  it('should have no link and mark the slug as generated when the slug is missing or default', () => {
    expect(viewOf({ ...overview, profile: { ...profile, slug: null } }).link).toBeNull();
    expect(viewOf({ ...overview, profile: { ...profile, slug: 'trainer-12' } }).generated).toBe(
      true,
    );
  });
});
