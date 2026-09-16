import { AppPaths } from '@core/config/app-paths';
import { LayoutMenuItem } from './layout-menu-item';

export const APP_MENU: readonly LayoutMenuItem[] = [
  {
    label: 'Asosiy',
    items: [
      { label: 'Boshqaruv paneli', icon: 'pi pi-fw pi-home', routerLink: [AppPaths.dashboard] },
    ],
  },
  {
    label: 'Katalog',
    items: [
      { label: 'Mashqlar', icon: 'pi pi-fw pi-list-check', routerLink: [AppPaths.exercises] },
      { label: 'Ovqatlar', icon: 'pi pi-fw pi-apple', routerLink: [AppPaths.foods] },
      { label: 'Media fayllar', icon: 'pi pi-fw pi-images', routerLink: [AppPaths.media] },
    ],
  },
  {
    label: 'Foydalanuvchilar',
    items: [
      {
        label: 'Kirishlar jurnali',
        icon: 'pi pi-fw pi-history',
        routerLink: [AppPaths.userSessions],
      },
    ],
  },
  {
    label: 'Bildirishnomalar',
    items: [
      {
        label: 'Shablonlar',
        icon: 'pi pi-fw pi-file-edit',
        routerLink: [AppPaths.notificationTemplates],
      },
      { label: 'Push yuborish', icon: 'pi pi-fw pi-send', routerLink: [AppPaths.sendNotification] },
    ],
  },
];
