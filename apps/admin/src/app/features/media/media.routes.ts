import { pageTitle } from '@core/i18n/page-title';
import { Routes } from '@angular/router';
import { MediaPage } from './pages/media-page/media-page';

export const MEDIA_ROUTES: Routes = [
  { path: '', title: pageTitle('layout.titles.media'), component: MediaPage },
];
