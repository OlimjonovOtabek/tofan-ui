# Platform fee feature

## Purpose

The admin sees and changes the global Platform fee.
It is the commission amount, the tax percent and the payment provider percent added on top of a Trainer subscription price.
Tofan tariffs (Free, Standard, VIP) get none of them since the 2026-11-05 backend decision, so the page says so in its subtitle.
It is one page in the "Narxlar" menu group.
It replaces the old per-Trainer commission percent, which was removed from the `trainers` feature together with its endpoint.

## Backend

- Base route: `/admin/platform-fee`
- Endpoints used:
  - `GET /admin/platform-fee` returns `commissionAmount`, `taxPercent`, `providerFeePercent` and `currencyCode` (for example `UZS`).
    The wire field is `currencyCode`, not `currency`.
  - `PUT /admin/platform-fee` takes the three numbers `commissionAmount`, `taxPercent` and `providerFeePercent`.
    It answers with a bare `Result` without data, so the store reloads after a save instead of reading the response.
- Access (backend policy): `Policies.Admin`
- Error codes handled: none by code.
  A refusal arrives as ProblemDetails or a failed `Result`.
  `toErrorMessage` shows the backend's own `messages`, or the joined validation issues, in the toast.
- Contract source: `admin-ui-platform-fee-v1.md`, `admin-ui-platform-fee-v1.1.md` and the stage Swagger.
  `providerFeePercent` is required in the `PUT`: a missing value becomes `0`.

## Screens

| Route           | Page                                           | Access                   |
| --------------- | ---------------------------------------------- | ------------------------ |
| `/platform-fee` | `pages/platform-fee-page` (`PlatformFeeStore`) | `authGuard` (admin role) |

## Structure notes

- `PlatformFeePage` provides `PlatformFeeStore` and loads on creation.
  It shows one of three things: the error with a retry button (`store.loadError()`), the form (`store.fee()`), or the loading line.
  A failed load clears the fee on purpose, so the page never shows stale values next to an error.
- `components/platform-fee-form` is a presentational Signal Forms form with `[formRoot]`.
  Its value is a `linkedSignal` of the `fee` input, so every reload, a save included, puts the backend's values into the fields.
  It emits a `PlatformFeeDraft` on a valid submit and never writes.
- The page asks `ConfirmDialogService` before every save and calls `store.save(draft)` only after a yes.
  The store sends the draft, shows the success toast and reloads.
  A failed save shows the error toast, keeps the form as it is and does not reload.
- The currency is the suffix of the commission field (` UZS`), and the percent fields end with `%`.
  A note under the fields says a change affects only payments opened after it.
- `models/platform-fee-rules.ts` holds the limits: commission at least 0, percents from 0 to 100, at most two decimals.
  `createPlatformFeeDraft` in `models/platform-fee-draft.ts` applies them in `PlatformFeeStore.save`, so the store refuses an invalid draft with a `ValidationError` (shown as an error toast, nothing is sent) even if a caller skips the form.
  `components/platform-fee-form/platform-fee.schema.ts` applies them with `required`, `min`, `max` and a decimals check, each with a typed message key.

- `components/platform-fee-sample` shows a sample Trainer payment for a 200 000 price (`SAMPLE_TRAINER_PRICE`) under the fields.
  It uses the values in the form before they are saved and hides while the form is not valid.
  `models/trainer-price-breakdown.ts` follows the backend formula (`PlatformFee.TaxOn`, `ProviderFeeOn`, `TotalFor`):
  `tax = round((price + commission) * taxPercent / 100)`, `provider = round((price + commission + tax) * providerFeePercent / 100)`, `total = price + commission + tax + provider`.
  Each step is rounded on its own to a whole sum, half up.

## Traps

- The breakdown counts in cents and basis points, never with float percents.
  `Math.round(375 * 9.2 / 100)` gives 34 because the float is 34.49999…, while the backend gives 35.
  `trainer-price-breakdown.spec.ts` keeps that case.

- Never read `currency`; the field is `currencyCode`.
- `PUT` returns no data.
  Keep the reload in `PlatformFeeStore.save`, or the form keeps the old values.
- `NumberField` emits `null` when the admin clears the input.
  `toPlatformFeeDraft` returns `null` for that and the form refuses to submit.
  Never turn a blank into `0`, because `0` is a valid fee.
- `p-inputnumber` writes its value asynchronously after the first render.
  Component tests need `await fixture.whenStable()` and a second `detectChanges()` before they read the input text.
- The menu group "Narxlar" is shared with the Tariffs feature.
  Add its items to the same group in `core/layout/menu/app-menu.ts`.
