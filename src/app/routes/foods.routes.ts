import { Routes } from '@angular/router';
import { environment } from '@environments/environment';
import { FoodsPage } from '@presentation/pages/foods/foods-page';
import { provideFoods } from '../di/foods.providers';

/** Lazy feature root: the catalog's adapters load with the page, not with the app shell. */
export const FOOD_ROUTES: Routes = [
  {
    path: '',
    title: 'Ovqatlar katalogi',
    providers: [provideFoods({ useMockApi: environment.useMockApi })],
    component: FoodsPage,
  },
];
