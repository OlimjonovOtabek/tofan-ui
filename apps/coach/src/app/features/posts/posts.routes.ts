import { Routes } from '@angular/router';
import { PUSHED_ROUTE } from '@coach/core/layout/coach-navigation';
import { pageTitle } from '@core/i18n/page-title';
import { PostsPage } from './pages/posts-page/posts-page';

export const POST_ROUTES: Routes = [
  {
    path: '',
    title: pageTitle('coachApp.posts.title'),
    data: { [PUSHED_ROUTE]: true },
    component: PostsPage,
  },
];
