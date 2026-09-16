import { MenuItem } from '@openng/optimus-ui/api';

export interface LayoutMenuItem extends MenuItem {
  path?: string;
  items?: LayoutMenuItem[];
}
