import { pageTitle } from '@core/i18n/page-title';
import { Routes } from '@angular/router';
import { FoodsPage } from './pages/foods-page/foods-page';

export const FOOD_ROUTES: Routes = [
  { path: '', title: pageTitle('layout.titles.foods'), component: FoodsPage },
];
