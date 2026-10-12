import { SheriffConfig, anyTag } from '@softarc/sheriff-core';

export const config: SheriffConfig = {
  entryPoints: {
    admin: 'apps/admin/src/main.ts',
    coach: 'apps/coach/src/main.ts',
  },
  enableBarrelLess: true,
  modules: {
    'apps/admin/src/app': {
      'core/<area>': ['type:core', 'core:<area>'],
      'shared/<area>': 'type:shared',
      'features/<feature>': 'type:feature',
      routes: 'type:routes',
    },
    'libs/core/src': {
      '<area>': ['type:core', 'core:<area>'],
    },
    'libs/shared/src': {
      '<area>': 'type:shared',
    },
    'apps/coach/src/app': {
      'core/<area>': 'type:coach-core',
      'features/<feature>': 'type:coach-feature',
      routes: 'type:coach-routes',
    },
  },
  depRules: {
    noTag: anyTag,
    root: ['type:core', 'type:routes', 'type:coach-core', 'type:coach-routes'],
    'core:*': anyTag,
    'type:core': ['type:core', 'type:shared', 'noTag'],
    'type:shared': ['type:shared', 'core:http', 'core:feedback', 'core:i18n'],
    'type:feature': ['type:core', 'type:shared'],
    'type:routes': ['type:feature', 'core:auth', 'core:layout'],
    'type:coach-core': ['type:coach-core', 'type:core', 'type:shared'],
    'type:coach-feature': ['type:coach-core', 'type:core', 'type:shared'],
    'type:coach-routes': ['type:coach-feature', 'type:coach-core', 'core:auth'],
  },
};
