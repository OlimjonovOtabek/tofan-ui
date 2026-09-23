import { Routes } from '@angular/router';
import { pageTitle } from '@core/i18n/page-title';
import { GarmentsPage } from './pages/garments-page/garments-page';

export const GARMENT_ROUTES: Routes = [
  { path: '', title: pageTitle('layout.titles.garments'), component: GarmentsPage },
];
