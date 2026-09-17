---
paths:
  - "src/app/**/components/**/*.ts"
  - "src/app/**/pages/**/*.ts"
  - "src/app/core/layout/**/*.ts"
  - "src/app/**/*.html"
---

# Component rules

## Reusable and feature components (`shared/components/`, `features/<x>/components/`)
- Inputs via `input()` / `input.required()`, events via `output()`, two-way via `model()`.
- No `inject()` of stores, HTTP services or Router (exception: `shared/components/file-upload`
  uses `FileUploadService` because uploading is its whole purpose).
- Pure rendering: derive with `computed()`, never mutate inputs.
- Name by what it shows: `ExerciseFormDialog`, `DataTable`, `LocalizedTextField`.
- A full-screen shell page (theme switcher, links to app paths) belongs to `core/layout/components/`
  (example: `StatusCard`), not to `shared/components/`.

## Pages (`features/<x>/pages/<name>-page/`)
- Provide and inject the store, pass signals down, handle outputs by calling store methods.
- No business rules, no mapping, no HTTP.
- Read route and query params with component input binding: `readonly userId = input<string>()`.

## Template rules
- `@for (x of items(); track x.id)` — always track by a stable id, never `$index` for entities.
- Every async screen has loading, empty and error states.
- Prefer `computed()` over method calls in templates.
- `@let` for repeated signal reads inside a block.
- Accessible: every icon-only button has `aria-label`; form fields have labels.

## Example

```ts
@Component({
  selector: 'app-exercises-page',
  imports: [DataTable, ExerciseFormDialog],
  providers: [ExercisesStore],
  templateUrl: './exercises-page.html',
})
export class ExercisesPage {
  protected readonly store = inject(ExercisesStore);
}
```
