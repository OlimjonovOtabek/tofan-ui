# Benefits dialog (shared)

## Purpose
`app-benefits-dialog` edits an ordered list of Benefits.
A Benefit is one line of plain text that a Soldier reads about a Tariff or a Tier, written in three languages.
The same dialog serves Trainer Tier Benefits (ticket 08, `trainers` feature) and Tofan Tariff Benefits (ticket 10, `tariffs` feature), so the admin learns one editor.
The dialog only edits.
The page and its store do the write.

## Files
- `libs/shared/src/models/benefit.ts`: the `Benefit` model, the limits and the pure rules.
- `libs/shared/src/components/benefits-dialog/benefits-dialog.{ts,html}`: the dialog.
- `libs/shared/src/components/benefits-dialog/benefits.schema.ts`: the Signal Forms row model and validation schema.
- Texts: `common.benefits.*` in `libs/core/src/i18n/translations/{uz,ru,en}/common.ts`.

## Model
- `Benefit` is `{ en, uz, ru }` (the same shape as `LocalizedText`).
- `BENEFIT_TEXT_MAX_LENGTH` is 200 and `BENEFITS_MAX_COUNT` is 20.
- `benefitTextProblem(text)` returns `'required'` (empty or only spaces), `'tooLong'` (more than 200 characters after trimming) or `null`.
- `canAddBenefit(count)` is true while fewer than 20 Benefits exist.
- `moveBenefit(items, from, to)` returns a new list with one item moved and ignores an out of range target.
- The wire names are not part of the model: the backend sends and expects `name` (English), `nameRu` and `nameUz`.
  Each feature keeps its own DTO and maps `{ name, nameRu, nameUz }` to and from `Benefit` in its `*.mapper.ts` (`trainers`: `tier-benefit.mapper.ts`).

## Contract
| Direction | Name | Type | Meaning |
|---|---|---|---|
| in | `visible` | `model.required<boolean>()` | two-way open state, bind with `[(visible)]` |
| in | `header` | `input.required<string>()` | dialog title, already translated by the page |
| in | `benefits` | `input<readonly Benefit[]>([])` | the current saved Benefits, in saved order |
| in | `saving` | `input(false)` | true while the page's write is running |
| out | `save` | `output<readonly Benefit[]>()` | the whole ordered list, trimmed, only when every row is valid |

How a page uses it:

```html
<app-benefits-dialog
  [(visible)]="dialogVisible"
  [header]="dialogHeader()"
  [benefits]="editingBenefits()"
  [saving]="store.saving()"
  (save)="save($event)"
/>
```

The page handler calls the store with the emitted list, and closes the dialog only when the store returns `true`.
The store sends the whole list in one request, reloads and raises the toast.

## Behaviour
- Each row has English, Russian and Uzbek inputs, in that order, a drag handle, move up, move down and remove buttons.
- Every text is required and at most 200 characters.
  The check trims spaces, so a text of only spaces is empty.
- At most 20 rows: the add button is disabled at 20.
- The first row cannot move up and the last row cannot move down.
- Dragging uses the CDK drag handle.
  The up and down buttons are the keyboard way to reorder and carry the row number in their `aria-label`.
- Benefits have no backend id, so every row gets a client side key (`benefit-1`, `benefit-2`, ...) that lives only in the dialog.
  The key is used for input ids and as the `@for` track expression, never sent.
  The loop walks the plain row values (`rows()`, `track row.key`) and reads the matching field with `form.rows[index]`, so typing keeps focus, a moved row keeps its element, its typed text and its errors, and moving rows does not re-create the list (no `NG0956`).
- After a move with the up or down button the focus stays on the moved row's same button at its new index.
  Angular moves DOM nodes to reorder them and the browser drops the focus of a moved node, so `moveByButton` restores it in `afterNextRender`.
  When the row reaches the first place the up button is disabled and the focus goes to its down button; at the last place it goes to its up button.
  Dragging does not touch the focus.
- The emitted order equals the visible order: the dialog emits `toBenefits(rows)` from the same list that is rendered.
- The texts are trimmed on emit.
- An empty list is valid and removes every Benefit.
- A plain text warning is always shown in the dialog: Benefits do not follow limit changes, so the admin must edit lines such as "Oyiga 15 marta" by hand after changing a limit.
- Opening the dialog (`visible` turns true) resets the rows from `benefits`, so unsaved edits from an earlier opening are dropped.
  Changing `benefits` while the dialog is open does not reset the rows.
- Invalid rows show their error after the first save attempt (field touched) and block the emit.
  A blocked save also scrolls the first invalid field (row order, then English, Russian, Uzbek) to the middle of the dialog body and focuses it, so an invalid row below the visible area is noticed.
  Focusing goes through `focusBoundControl`, which needs `TextField.focus()` (a `FormValueControl` hook).

## Traps
- The page must set the `benefits` input before it sets `visible` to true, because the rows are read when the dialog opens.
- The dialog does not validate against the backend.
  The backend owns the rules and answers a refusal that the store shows as a toast.
- The CDK drag preview is appended to `body` with `z-index: 1000`, and Optimus modal dialogs start at 1100, so the default preview would hide behind the dialog.
  The dialog provides `CDK_DRAG_CONFIG` with `zIndex: 2000` so the dragged row stays visible.
  The preview position was not checked in a real browser during development (unit tests cannot drag).
  Check it by hand before changing the container, for example to `cdkDragPreviewContainer="parent"`: a CSS transform on an ancestor changes what `position: fixed` is relative to.
- Do not track rows by the field (`track row`) and do not read `row().value().key` in the template: the first was seen re-creating the whole list on a move in the browser (`NG0956`, focus dropped to `BODY`) and reading a removed row's value throws "Orphan field".
  Track the plain row value by its `key` and look the field up by index.
- A move changes the order of the DOM nodes, so any new control inside a row that must keep keyboard focus after a move needs the same restore as the move buttons.
- Do not use `LocalizedTextField` for Benefits: it is built on Reactive Forms and has a single localized value, not an array of rows.
