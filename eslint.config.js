// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

/**
 * Clean Architecture dependency rule: source code dependencies point only inwards.
 *
 *   presentation ─┐
 *                 ├─> application ─> domain
 *   infrastructure┘ ─────────────────> domain
 *
 * `src/app/di` and `app.config.ts` are the composition root and may import every layer.
 */
const forbid = (...groups) => ['error', { patterns: groups }];

const layer = {
  angular: {
    group: ['@angular/*', '@openng/*', 'rxjs', 'rxjs/*'],
    message: 'Keep this layer framework-agnostic.',
  },
  application: {
    group: ['@application/*', '**/application/**'],
    message: 'This layer must not depend on application.',
  },
  infrastructure: {
    group: ['@infrastructure/*', '**/infrastructure/**'],
    message: 'Depend on a domain port instead of an infrastructure adapter.',
  },
  presentation: {
    group: ['@presentation/*', '**/presentation/**'],
    message: 'Inner layers must not depend on presentation.',
  },
  environments: {
    group: ['@environments/*', '**/environments/**'],
    message: 'Read configuration in the composition root (src/app/di) and pass it in.',
  },
  ui: {
    group: ['@openng/*'],
    message: 'UI libraries belong to presentation.',
  },
};

module.exports = defineConfig([
  {
    ignores: ['src/app/infrastructure/api/generated/**'],
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: ['element', 'attribute'], prefix: 'app', style: 'kebab-case' },
      ],
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        { accessibility: 'no-public', overrides: { constructors: 'off' } },
      ],
    },
  },
  {
    files: ['src/app/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': forbid(
        layer.angular,
        layer.application,
        layer.infrastructure,
        layer.presentation,
        layer.environments,
      ),
    },
  },
  {
    files: ['src/app/application/**/*.ts'],
    rules: {
      'no-restricted-imports': forbid(
        layer.angular,
        layer.infrastructure,
        layer.presentation,
        layer.environments,
      ),
    },
  },
  {
    files: ['src/app/infrastructure/**/*.ts'],
    rules: {
      'no-restricted-imports': forbid(layer.presentation, layer.environments, layer.ui),
    },
  },
  {
    // The app shell (auth, HTTP, the API client) is in the initial bundle. Importing a value from
    // the generated barrel there drags every module the barrel re-exports into it, so the shell
    // imports generated code by its own path. Lazy feature modules may use the barrel.
    files: [
      'src/app/infrastructure/auth/**/*.ts',
      'src/app/infrastructure/http/**/*.ts',
      'src/app/infrastructure/api/*.ts',
    ],
    ignores: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: ['@infrastructure/api/generated', './generated'].map((name) => ({
            name,
            allowTypeImports: true,
            message: 'Import generated code by its own path to keep it out of the initial bundle.',
          })),
        },
      ],
    },
  },
  {
    files: ['src/app/presentation/**/*.ts'],
    rules: {
      'no-restricted-imports': forbid(layer.infrastructure, layer.environments),
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
]);
