import { Routes } from '@angular/router';
import { SoldierPage } from './pages/soldier-page/soldier-page';
import { SoldiersPage } from './pages/soldiers-page/soldiers-page';

export const SOLDIER_ROUTES: Routes = [
  { path: '', title: 'Soldierlar', component: SoldiersPage },
  { path: ':userId', title: 'Soldier', component: SoldierPage },
];
