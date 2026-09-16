import { AppPaths } from '@presentation/routing/app-paths';
import { LayoutMenuItem } from './layout-menu-item';

/** Sidebar navigation. Root items are section headers; add feature links under them. */
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
