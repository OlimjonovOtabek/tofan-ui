import { TranslationKey } from '@core/i18n/dictionary';
import { IconName } from '../ui/icon/icon-name';

export interface CoachTab {
  readonly path: string;
  readonly label: TranslationKey;
  readonly icon: IconName;
  readonly activeIcon: IconName;
}

export const COACH_TABS: readonly CoachTab[] = [
  {
    path: '/dashboard',
    label: 'coachApp.nav.dashboard',
    icon: 'nav-dashboard',
    activeIcon: 'nav-dashboard-active',
  },
  {
    path: '/programs',
    label: 'coachApp.nav.programs',
    icon: 'nav-programs',
    activeIcon: 'nav-programs-active',
  },
  {
    path: '/clients',
    label: 'coachApp.nav.clients',
    icon: 'nav-clients',
    activeIcon: 'nav-clients-active',
  },
  { path: '/chat', label: 'coachApp.nav.chat', icon: 'nav-chat', activeIcon: 'nav-chat-active' },
  {
    path: '/profile',
    label: 'coachApp.nav.profile',
    icon: 'nav-profile',
    activeIcon: 'nav-profile-active',
  },
];

export const PUSHED_ROUTE = 'pushed';

export interface RouteNode {
  readonly data: Readonly<Record<string, unknown>>;
  readonly firstChild: RouteNode | null;
}

export function isPushedRoute(root: RouteNode): boolean {
  let node: RouteNode | null = root;
  while (node !== null) {
    if (node.data[PUSHED_ROUTE] === true) {
      return true;
    }
    node = node.firstChild;
  }
  return false;
}
