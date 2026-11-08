# Trainers feature

## Purpose
The admin registers trainers (a new Keycloak account, the `trainer` role and the card in one request),
edits them, sets a new password, deletes drafts, publishes or unpublishes them, grants a user a
subscription to a trainer and ends a subscription. One section, three tabs: "Trenerlar", "Obunalar"
and "Darajalar".
The "Darajalar" tab shows the two Trainer subscription Tiers (Standard and VIP) with their Benefits and
lets the admin edit each Tier's Benefits.
The trainer panel (`/coach/*`) is not part of this app.

## Backend
- Base routes: `/admin/trainers`, `/admin/trainer-subscriptions`; photo: `GET /files/{id}/content`.
- Endpoints used:
  - `POST /admin/trainers` (`username`, `email`, `phoneNumber?`, `password`, `displayName`, `bio?`,
    `photoFileId?`) → card `Guid`. The backend opens the account and gives it the role; an existing
    account cannot be made a trainer.
  - `PUT /admin/trainers/{id}` (`email`, `phoneNumber?`, `displayName`, `bio?`, `photoFileId?`,
    `monthlyPrice` ≥ 0, `vipMonthlyPrice` a number above 0 or `null`). The username is shown but cannot change
    (the realm forbids it). `vipMonthlyPrice` is always in the body, see "VIP price" below.
  - `GET /admin/users/{userId}`: only to fill the username, email and phone in the edit dialog, through
    `TrainerAccountsService` with its own DTO, never the accounts feature.
  - `PUT /admin/trainers/{id}/password` (`password` 8–128)
  - `DELETE /admin/trainers/{id}`: drafts only; removes the card and the Keycloak account.
  - `POST /files` (`category` avatar) through the shared `app-file-upload`: the optional photo in the
    add-trainer dialog. The trainer can replace it later in the coach panel (`PUT /coach/profile`).
  - `GET /admin/trainers` (paging, sort); each row carries `slug` and `vipMonthlyPrice` (`null` when the trainer
    sells Standard only)
  - `POST /admin/trainers/{id}/publish`, `POST /admin/trainers/{id}/unpublish`
  - `POST /admin/trainers/{id}/subscriptions` (`userId`, `months` 1–12) → `Guid`
  - `GET /admin/trainer-subscriptions` (paging, sort, `TrainerId`, `UserId`, `IsActive`); each row carries
    `tier` (`1` Standard, `2` VIP)
  - `POST /admin/trainer-subscriptions/{id}/end`
  - `PUT /admin/trainer-subscriptions/{id}/tier` (`tier` `1` or `2`): changes the Tier of an active subscription and leaves its dates alone
  - `GET /admin/soldiers` (`Search`, 10 rows): only for the soldier autocomplete in the grant dialog
  - `GET /public/trainer-tier-benefits`: both Tiers with their Benefits (no token needed, the panel calls
    it through `ApiClient` like every other endpoint). Each row is `{ tier: 1 | 2, benefits: [{ name, nameRu, nameUz }] }`;
    `name` is the English text and a Benefit has no id.
  - `PUT /admin/trainer-tier-benefits/{tier}` (path `1` Standard, `2` VIP): body `{ benefits: [{ name, nameRu, nameUz }] }`,
    always the whole ordered list; every text is required and at most 200 characters, at most 20 Benefits.
    An empty list removes all Benefits of the Tier.
- Access (backend policy): `Policies.Admin`.
- Error codes handled: `Trainer.PriceNotSet`, `Trainer.NotFound`, `Trainer.PublishedPriceRequired`,
  `Trainer.PublishedCannotBeDeleted`, `Trainer.HasSubscriptions` (backend `messages`, toast),
  `TrainerSubscription.OtherTrainerActive`,
  `WorkoutPlan.TrainerProgramMissing`, `MealPlan.TrainerProgramMissing`; client side:
  `Trainer.DisplayNameEmpty`, `User.InvalidUsername`, `TrainerSubscription.MonthsOutOfRange`, `UserId.Invalid`.
  `User.UsernameTaken` and `User.EmailTaken` show under the username or email field, not as a toast:
  `TrainersStore.takenAccount` keeps the refused value and the form schema marks the field invalid while
  it still holds that value (case and spaces ignored), so the same name cannot be sent twice.
  `IdentityProvider.RoleNotFound` shows the backend's own localized `messages` as a toast. In both cases
  the dialog stays open.
- Tier change errors: `TrainerSubscription.NotFound` (404) and `TrainerSubscription.NotActive` (400, the subscription already ended).
  Both have texts in all three languages and show as a toast.
- The password field has a show/hide eye (`app-password-field`, `p-password` with `toggleMask`).
- The list shows the trainer's `slug` in a read-only "Link" column (API v9.1). Only the trainer changes it
  (`PUT /coach/profile`, format `^[a-z0-9]+(-[a-z0-9]+)*$`, 3 to 30 characters); `CreateTrainerRequest` and
  `UpdateTrainerRequest` have no `slug`. It is plain text: the public page `peaktofan.com/t/<slug>` is opened by the
  mobile app only, so the panel builds no link and has no copy button. Old accounts may show `-` until the backend fills it.
- VIP price: the list has a read-only "VIP narxi" column (not sortable) that shows the price like the monthly price
  and a `-` when the trainer has none (`null`); a stored 0 is shown as it is, so an invalid value is not hidden. The edit dialog has an optional "VIP narxi" number field prefilled with the
  current value and the hint that an empty field means Standard only. Clearing the field sends `null` and the
  trainer stops selling VIP. A value of 0 or below is refused by the form (`trainers.edit.errors.vipPrice`); the panel
  does not compare it with the monthly price, the backend owns that rule. The create dialog has no VIP price: a new
  trainer starts as Standard only and sets or gets a VIP price later.
- Row actions (`TrainerRowActions`): edit, change password and grant a subscription on every trainer; publish or unpublish; delete only on drafts (published trainers
  must be unpublished first), with a confirm that says the Keycloak account goes too.
- The edit dialog waits for the account (`TrainersStore.loadAccount`) and closes itself if it cannot be
  read. Email, phone, name and bio rules are shared with the add dialog through `trainer-field.rules.ts`.
- The form mirrors the backend limits (username `^[A-Za-z0-9._@-]+$` up to 128, email up to 320,
  phone up to 32, password 8–128, name up to 200). The backend checks the name first and the account
  fields second, so without these client rules two-step errors would reach the admin.

## Screens
| Route | Page | Access |
|---|---|---|
| `/trainers` | `TrainersPage` (title, tab bar) with child `TrainersListPage` | admin |
| `/trainers/subscriptions` | `TrainersPage` with child `TrainerSubscriptionsPage` | admin |
| `/trainers/tiers` | `TrainersPage` with child `TrainerTiersPage` | admin |

## Structure notes
- The tabs are routed children of `TrainersPage`, so each tab has its own address and its own store
  (`TrainersStore`, `TrainerSubscriptionsStore`), provided by the child page.
- `TrainerSubscriptionsStore` loads the first 100 trainers for the trainer filter and the grant dialog.
- Granting is allowed from both tabs: from a trainer row the trainer is fixed, from the subscriptions
  tab it is chosen. Both stores prepare the grant with `createSubscriptionGrant`.
- Subscription status is derived: active when it was not ended and `endsOn` is later than now.
  The backend has one `endedOnUtc` for admin and expiry job, so "ended by admin" cannot be shown.
- The menu item uses a subset route match so it stays active on every tab.
- The subscriptions table has a "Tier" column (tag: Standard grey, VIP amber).
  An active subscription gets one icon action next to "End subscription".
  It reads "VIP qilish" on a Standard subscription and "Standard qilish" on a VIP one (`TrainerSubscription.targetTier()`).
  The page asks `ConfirmDialogService` first.
  Then `TrainerSubscriptionsStore.changeTier` calls `PUT .../tier`, shows `trainers.toast.tierChangedToVip` or `tierChangedToStandard`, and reloads the table.
  Ended subscriptions (`canChangeTier(now)` is false) get no action.
  The button labels, confirmations, toasts and icons live in `models/subscription-tier-labels.ts`, keyed by the Tier being switched to.
  The Tier itself comes from `libs/shared` (`Tier`, `TierDto`, `TIER_LABELS`).
- The grant dialog never lets the admin pick a Tier, because the backend always opens Standard.
  An info message at the top of the dialog says so and points to the "VIP qilish" action in the table.
- Actions are never disabled in advance because of backend rules (price missing, programs missing,
  another trainer active); the server's refusal is shown as a toast.

- The grant dialog picks the user from `SoldierField` (an Optimus autocomplete wrapped as a form control).
  `SoldierSearchStore` is provided by each page; the dialog emits `soldierSearch` and the page forwards it.
  The dialog asks for the first 10 soldiers when it opens, and the field asks again on focus and on typing.
  Reading `/admin/soldiers` goes through `SoldierLookupService` with its own DTO, never the soldiers feature.
  The field, the store, the service and `SoldierOption` live in `libs/shared/src/components/soldier-field` (and `shared/models/soldier-option.ts`),
  because the payment orders create dialog uses the same picker.
  The shown name follows the form value (`linkedSignal` on `value`), so a dialog that resets its form also clears the name in the field.

### Tiers tab ("Darajalar")
- `TrainerTiersPage` provides `TrainerTiersStore` and shows one `TierCard` per Tier, Standard first, then VIP.
  Each card lists the Tier's Benefits in the admin's current language (`pickLocalized`: the other languages are the fallback when a text is blank) and has an "Imtiyozlar" button.
- The button opens the shared `app-benefits-dialog` with that Tier's Benefits.
  The dialog contract, limits and traps are in `docs/modules/benefits-dialog.md`.
  The page calls `TrainerTiersStore.changeBenefits(tier, benefits)` with the emitted list and closes the dialog only when it returns `true`.
- `Tier` and its integer enum come from `libs/shared/src/models/tier*.ts`; the feature never imports another feature.
- `TierBenefitsService` reads and writes through `ApiClient`.
  `tier-benefit.mapper.ts` converts `{ name, nameRu, nameUz }` to the shared `Benefit` (`{ en, ru, uz }`) and back, and always returns both Tiers in the order Standard, VIP.
  A Tier the backend omits shows an empty list, and a Tier this panel does not know is skipped.
- After a successful save the store reloads the list from `GET /public/trainer-tier-benefits`, so the cards show what the backend stored.
  A failed save keeps the dialog open with the typed rows and shows the backend error as a toast.
- A failed load shows an inline error with a retry; it never looks like an empty Tier.

## Traps
- There is no endpoint to read one trainer, so there is no detail page.
- Valid `SortField` values for subscriptions are not documented in Swagger; the table sorts by
  `startsOnUtc` and `endsOnUtc` (sent as `starts_on_utc`, `ends_on_utc`); the trainers table sorts by `displayName`, `monthlyPrice` and `createdOnUtc`. Confirm with the backend.
- The maximum `Rows` of `GET /admin/trainers` is unknown; options for the filter and dialog use 100.
- There is no per-trainer commission any more. The backend removed `PUT /admin/trainers/{id}/commission`
  (it answers `404`) and `commissionPercent` is gone from the trainer row; the panel dropped the column,
  its sort, the row action, the dialog and `Trainer.InvalidCommissionPercent`. The commission is now one
  global Platform fee (commission amount, tax and payment provider fee) managed on the admin Platform fee
  page (`docs/modules/platform-fee.md`), not per trainer.
- `GET /admin/payment-orders` also returns `commissionPercent` per order, but the panel has no payment
  orders screen yet.
- Always send `vipMonthlyPrice` in `PUT /admin/trainers/{id}`: the backend treats a missing key as `null`, so an
  update without it silently wipes the trainer's VIP price. `UpdateTrainerRequest.vipMonthlyPrice` is a required key,
  `TrainerEditDraft` carries it, and the edit form is prefilled from `Trainer.vipMonthlyPrice`, so changing the name,
  bio, photo, email, phone or price keeps it. `trainers.service.spec.ts` proves the key is on the wire as `null` and as
  a number. `app-number-field` emits `null` when the admin clears the input, which must stay `null` and never become 0.
- A trainer without a price stays a draft: only the trainer can set the price (`PUT /coach/profile`).
- The subscriptions list has no Tier filter (the backend has no query parameter for it).
- A backend without Tiers (the API v9.1 proxy before the release day) sends no `tier`.
  The mapper reads that as Standard so the table still loads.
  The tier action only works against the stage API.
- Tier Benefits have no id on the wire.
  The order of the array is the only order, so the whole list is sent on every save and the saved order must equal the order shown in the dialog.
- `GET /public/trainer-tier-benefits` is anonymous and `PUT /admin/trainer-tier-benefits/{tier}` is admin only.
  Swagger lists no 404 for the PUT.
- Benefits are plain text.
  They do not follow limit changes, which is why the dialog always shows the plain text warning.
