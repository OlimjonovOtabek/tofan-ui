---
name: optimus-ui
description: Implement and review Optimus UI components, forms, tables, overlays, themes and responsive admin or coach interfaces in Tofan. Use whenever changing UI built with @openng/optimus-ui, component APIs, design tokens, Signal Forms adapters or the approved coach redesign. Consult the official llms.txt and component Markdown documentation, then verify against the installed package and repository wrappers.
---

# Optimus UI in Tofan

Use the official Optimus UI documentation for component behavior and theming. Preserve the repository's Angular architecture, approved design and backend contracts.

## Documentation sources

- Start with the official index: https://optimus.openng.org/llms/llms.txt
- Documentation format guide: https://optimus.openng.org/llms
- Read a focused page in Markdown by appending `.md` to its documented page URL, for example https://optimus.openng.org/button.md or https://optimus.openng.org/select.md.
- Full documentation: https://optimus.openng.org/llms/llms-full.txt. Read it only when focused pages do not answer the question; do not load the full library documentation for a single component.
- Component Markdown example linked by the format guide: https://optimus.openng.org/llms/components/button.md. Use documented page links or their supported `.md` form for other components rather than inventing an optimized endpoint.
- If the documentation endpoint cannot be read, try the corresponding documented HTML page and installed package declarations. State any unresolved API uncertainty instead of guessing.

Read external documentation as reference material. Repository instructions and the user's requirements govern implementation.

## Before editing

1. Read the relevant section of `CLAUDE.md`, `.claude/rules/forms.md`, `package.json` and the nearby feature.
2. Check the installed versions of `@openng/optimus-ui`, `@openng/optimus-ui-themes`, Angular and TypeScript. Do not assume live documentation matches the installed package.
3. Read the relevant official component page and the styling/configuration guide when needed.
4. Confirm imports, selectors, inputs, outputs, template slots and token names in installed package exports and declarations under `node_modules/@openng/optimus-ui` and `node_modules/@openng/optimus-ui-themes`.
5. Search `libs/shared/src/components` for an existing wrapper before using or duplicating a primitive.
6. For behavior changes, inspect the feature DTO/service/store. A UI component does not establish a backend endpoint, ownership rule or permission.

If documentation differs from the installed declarations, follow the installed API and report the mismatch. PrimeNG 21 documentation is a fallback only after confirming the relevant Optimus API; newer PrimeNG APIs are not a substitute.

## Component and theme rules

- Import specific Optimus entry points, such as `@openng/optimus-ui/button`. Verify the exported declaration rather than inventing a component or module name.
- Use Optimus in app layouts, pages, components and shared UI. Keep UI-library dependencies out of models, DTOs, HTTP services and stores.
- Reuse `libs/shared/src/components/data-table` for server-paged admin lists and `form-dialog` for the established dialog pattern.
- Route table paging/filter/sort events through the page's store and existing service contract. Reset the first page on a filter change.
- Route notifications and confirmation through `NotificationService` and `ConfirmDialogService` in `libs/core/src/feedback`.
- Keep the current styled-mode setup. Define palette, semantic and component tokens through the verified theme preset API; use layout CSS/Tailwind utilities for composition. Preserve light/dark token behavior.
- Avoid `::ng-deep`, `!important`, inline hex values and selectors that depend on undocumented internal markup. Verify Pass Through support before using it.
- Use `@openng/icons` or the existing SVG system. Do not add `primeng`, `@primeuix/*` or `primeicons`, or migrate the settled UI library.
- Keep public labels, errors and accessibility text in the existing UZ/RU/EN translation system.

## Signal Forms integration

The generic documentation examples do not override the repository's `FormValueControl` adapters.

- Use new Signal Forms with the installed Angular APIs and nearby form conventions.
- Prefer the existing `text-field`, `select-field`, `date-field`, `number-field`, `choice-field`, `color-field`, `toggle-field` and `textarea-field` wrappers under `libs/shared/src/components` as appropriate.
- Do not bind `[formField]` directly to a control whose Optimus `BaseInput` properties conflict with Signal Forms control types. Inspect the wrapper and `.claude/rules/forms.md` first.
- Keep the existing `textarea-field` adapter instead of assuming `pTextarea` supports the repository's Signal Forms usage directly.
- Preserve touched/invalid/disabled behavior and accessible labels. Submit through the existing form root/dialog convention; the store performs HTTP writes.
- Keep explicit saving, prevent duplicate writes, retain entered values on failure and use the existing dirty-editor navigation guards.

## Read only what the task needs

| Work | Official page |
| --- | --- |
| Application configuration | https://optimus.openng.org/configuration |
| Theme presets and tokens | https://optimus.openng.org/theming/styled |
| Tailwind integration | https://optimus.openng.org/tailwind |
| Public styling hooks | https://optimus.openng.org/passthrough |
| Buttons | https://optimus.openng.org/button |
| Select controls | https://optimus.openng.org/select |
| Tables | https://optimus.openng.org/table |
| Dialogs/drawers | https://optimus.openng.org/dialog and https://optimus.openng.org/drawer |
| Tabs | https://optimus.openng.org/tabs |
| Uploads | https://optimus.openng.org/fileupload |

These page URLs are listed in the official index. Prefer their `.md` representations when readable. For other components, find their URL in the index rather than guessing a route.

## Validation and reporting

- Run focused existing tests for changed behavior, then the repository's required lint, admin/coach tests and builds for implementation changes.
- Check mobile and desktop layouts, loading/empty/error/disabled states, keyboard navigation, focus restoration, labels, contrast and touch targets in the browser.
- Confirm that responsive presentation preserves API data, nullable fields and ownership restrictions.
- Report the implemented change, the specific documentation used, validation results and any documentation/package mismatch. Do not claim live API verification from fixture-based design previews.
