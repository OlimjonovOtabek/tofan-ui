import { Routes } from '@angular/router';
import { notFoundHead } from '@landing/core/seo/head-resolvers';
import { NotFoundPage } from './pages/not-found-page/not-found-page';

export const NOT_FOUND_ROUTES: Routes = [
  { path: '', resolve: { head: notFoundHead }, component: NotFoundPage },
];
