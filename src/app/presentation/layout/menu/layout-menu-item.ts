import { MenuItem } from '@openng/optimus-ui/api';

export interface LayoutMenuItem extends MenuItem {
  /**
   * URL prefix shared by the routes of this group's children (e.g. `/settings`).
   * The group is expanded automatically while the current URL starts with it.
   */
  path?: string;
  items?: LayoutMenuItem[];
}
