import { MenuItem } from '@openng/optimus-ui/api';
import { TranslationKey } from '@core/i18n/dictionary';

export interface LayoutMenuItem extends MenuItem {
  label: TranslationKey;
  path?: string;
  items?: LayoutMenuItem[];
}
