import { pageTitle } from '@core/i18n/page-title';
import { Routes } from '@angular/router';
import { SoldierPage } from './pages/soldier-page/soldier-page';
import { SoldiersPage } from './pages/soldiers-page/soldiers-page';

export const SOLDIER_ROUTES: Routes = [
  { path: '', title: pageTitle('layout.titles.soldiers'), component: SoldiersPage },
  { path: ':userId', title: pageTitle('layout.titles.soldier'), component: SoldierPage },
];
