import { Routes } from '@angular/router';
import { PUSHED_ROUTE } from '@coach/core/layout/coach-navigation';
import { pageTitle } from '@core/i18n/page-title';
import { VideoCollectionPage } from './pages/video-collection-page/video-collection-page';
import { VideoCollectionsPage } from './pages/video-collections-page/video-collections-page';

const pushed = { [PUSHED_ROUTE]: true };

export const VIDEO_COLLECTION_ROUTES: Routes = [
  {
    path: '',
    title: pageTitle('coachApp.videoCollections.title'),
    data: pushed,
    component: VideoCollectionsPage,
  },
  {
    path: ':collectionId',
    title: pageTitle('coachApp.videoCollections.detailTitle'),
    data: pushed,
    component: VideoCollectionPage,
  },
];
