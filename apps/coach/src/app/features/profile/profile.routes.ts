import { Routes } from '@angular/router';
import { PUSHED_ROUTE } from '@coach/core/layout/coach-navigation';
import { pageTitle } from '@core/i18n/page-title';
import { EarningsPage } from './pages/earnings-page/earnings-page';
import { EditProfilePage } from './pages/edit-profile-page/edit-profile-page';
import { PreviewVideosPage } from './pages/preview-videos-page/preview-videos-page';
import { PricingPage } from './pages/pricing-page/pricing-page';
import { ProfilePage } from './pages/profile-page/profile-page';

const pushed = { [PUSHED_ROUTE]: true };

export const PROFILE_ROUTES: Routes = [
  { path: '', title: pageTitle('coachApp.profile.title'), component: ProfilePage },
  {
    path: 'edit',
    title: pageTitle('coachApp.profile.editTitle'),
    data: pushed,
    component: EditProfilePage,
  },
  {
    path: 'pricing',
    title: pageTitle('coachApp.pricing.title'),
    data: pushed,
    component: PricingPage,
  },
  {
    path: 'earnings',
    title: pageTitle('coachApp.earnings.title'),
    data: pushed,
    component: EarningsPage,
  },
  {
    path: 'preview-videos',
    title: pageTitle('coachApp.previewVideos.title'),
    data: pushed,
    component: PreviewVideosPage,
  },
];
