import { Routes } from '@angular/router';
import { homeHead } from '@landing/core/seo/head-resolvers';
import { HomePage } from './pages/home-page/home-page';

export const HOME_ROUTES: Routes = [{ path: '', resolve: { head: homeHead }, component: HomePage }];
