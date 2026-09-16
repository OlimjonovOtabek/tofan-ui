import { Routes } from '@angular/router';
import { NotificationTemplatesPage } from './pages/notification-templates-page/notification-templates-page';
import { SendNotificationPage } from './pages/send-notification-page/send-notification-page';

export const NOTIFICATION_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'templates' },
  { path: 'templates', title: 'Bildirishnoma shablonlari', component: NotificationTemplatesPage },
  { path: 'send', title: 'Push yuborish', component: SendNotificationPage },
];
