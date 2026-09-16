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
- Show errors with `field().getError('required')`, only when `touched()`.
- Backend `ValidationError.issues` are shown after submit (they carry validator codes, not field names).
- The form component emits `submitted` with the value; the page/store performs the write.
- Optimus UI controls (`p-select`, `p-inputnumber`, `p-toggleswitch`, ...) are ControlValueAccessors and bind
  with `[formField]` directly. Wrap a control in `shared/components` implementing `FormValueControl` only if it does not.
