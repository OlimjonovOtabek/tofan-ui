import { Routes } from '@angular/router';
import { pageTitle } from '@core/i18n/page-title';
import { PlatformFeePage } from './pages/platform-fee-page/platform-fee-page';

export const PLATFORM_FEE_ROUTES: Routes = [
  { path: '', title: pageTitle('layout.titles.platformFee'), component: PlatformFeePage },
];
