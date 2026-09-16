import { Routes } from '@angular/router';
import { environment } from '@environments/environment';
import { NotificationTemplatesPage } from '@presentation/pages/notifications/notification-templates-page';
import { SendNotificationPage } from '@presentation/pages/notifications/send-notification-page';
import { provideNotifications } from '../di/notifications.providers';

/**
 * Lazy feature root. Both pages share one injector, so under `useMockApi` the send page sees
 * the templates created on the templates page.
 */
export const NOTIFICATION_ROUTES: Routes = [
  {
    path: '',
    providers: [provideNotifications({ useMockApi: environment.useMockApi })],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'templates' },
      {
        path: 'templates',
        title: 'Bildirishnoma shablonlari',
        component: NotificationTemplatesPage,
      },
      { path: 'send', title: 'Push yuborish', component: SendNotificationPage },
    ],
  },
];
