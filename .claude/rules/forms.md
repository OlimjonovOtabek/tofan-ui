---
paths:
  - "src/app/**/*form*.ts"
  - "src/app/**/*dialog*.ts"
  - "src/app/**/*.schema.ts"
---

# Form rules (Signal Forms)

- New forms use `form()` from `@angular/forms/signals` and `[formField]` bindings.
- Form model is a `signal<FormValue>()`; `FormValue` type lives next to the form component.
- Validation schema goes to `*.schema.ts` next to the form component when longer than ~10 lines.
- Validators: `required`, `minLength`, `maxLength`, `min`, `max`, `minDate`, `maxDate`, `pattern`, `validateHttp`.
- Conditional rules use the `{ when: ... }` option (the old function argument form is deprecated).
- Show field errors with `<app-field-error [field]="form.x()" />` (`shared/components/field-error`): it shows
  the first validator `message`, only when `touched()`. Every validator gets an Uzbek `message`.
- Backend `ValidationError.issues` are shown after submit (they carry validator codes, not field names).
- The form component emits the value (`save`, or a verb such as `extend`); the page/store performs the write.
- Native inputs with `pInputText` bind with `[formField]` directly (do not add `[invalid]` next to it),
  but they turn red before the user touches them. A required text field uses `app-text-field`
  (`shared/components/text-field`), which shows the invalid state only after a touch.
- Optimus UI controls built on `BaseInput` (`p-select`, `p-datepicker`, `p-inputnumber`, ...) do not compile
  with `[formField]`: their `min`, `max` and `pattern` inputs clash with `FormUiControl` types. Use the
  `FormValueControl` wrappers in `shared/components` (`app-select-field`, `app-date-field`,
  `app-number-field`, `app-choice-field` for `p-selectbutton`, `app-color-field` for `p-colorpicker`); add a new wrapper there when another
  control is needed.
- Never `(ngSubmit)` on a `<form>` without `FormsModule`/`ReactiveFormsModule`: nothing emits it and the
  browser submits natively, reloading the page. `app-form-dialog` handles `(submit)` itself and calls
  `preventDefault()`; a Signal Forms page form uses `[formRoot]` from `@angular/forms/signals`.
