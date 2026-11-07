import { Routes } from '@angular/router';
import { pageTitle } from '@core/i18n/page-title';
import { TariffsPage } from './pages/tariffs-page/tariffs-page';

export const TARIFF_ROUTES: Routes = [
  { path: '', title: pageTitle('layout.titles.tariffs'), component: TariffsPage },
];
