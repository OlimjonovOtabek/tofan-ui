import { pageTitle } from '@core/i18n/page-title';
import { Routes } from '@angular/router';
import { NotificationTemplatesPage } from './pages/notification-templates-page/notification-templates-page';
import { SendNotificationPage } from './pages/send-notification-page/send-notification-page';

export const NOTIFICATION_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'templates' },
  {
    path: 'templates',
    title: pageTitle('layout.titles.notificationTemplates'),
    component: NotificationTemplatesPage,
  },
  {
    path: 'send',
    title: pageTitle('layout.titles.sendNotification'),
    component: SendNotificationPage,
  },
];
