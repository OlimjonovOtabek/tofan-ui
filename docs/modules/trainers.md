# Trainers feature

## Purpose
The admin registers trainers (a new Keycloak account, the `trainer` role and the card in one request),
edits them, sets a new password, deletes drafts, publishes or unpublishes them, grants a user a
subscription to a trainer and ends a subscription. One section, two tabs: "Trenerlar" and "Obunalar".
The trainer panel (`/coach/*`) is not part of this app.

## Backend
- Base routes: `/admin/trainers`, `/admin/trainer-subscriptions`; photo: `GET /files/{id}/content`.
- Endpoints used:
  - `POST /admin/trainers` (`username`, `email`, `phoneNumber?`, `password`, `displayName`, `bio?`,
    `photoFileId?`) → card `Guid`. The backend opens the account and gives it the role; an existing
    account cannot be made a trainer.
  - `PUT /admin/trainers/{id}` (`email`, `phoneNumber?`, `displayName`, `bio?`, `photoFileId?`,
    `monthlyPrice` ≥ 0). The username is shown but cannot change (the realm forbids it).
  - `GET /admin/users/{userId}`: only to fill the username, email and phone in the edit dialog, through
    `TrainerAccountsService` with its own DTO, never the accounts feature.
  - `PUT /admin/trainers/{id}/password` (`password` 8–128)
  - `PUT /admin/trainers/{id}/commission` (`commissionPercent` 0–100, at most 2 decimals): the platform's
    share of the trainer's subscription payments, 5% by default. The percent is written to each payment
    when it is created, so a change applies only to later payments; the dialog says so.
  - `DELETE /admin/trainers/{id}`: drafts only; removes the card and the Keycloak account.
  - `POST /files` (`category` avatar) through the shared `app-file-upload`: the optional photo in the
    add-trainer dialog. The trainer can replace it later in the coach panel (`PUT /coach/profile`).
  - `GET /admin/trainers` (paging, sort); each row carries `commissionPercent`
  - `POST /admin/trainers/{id}/publish`, `POST /admin/trainers/{id}/unpublish`
  - `POST /admin/trainers/{id}/subscriptions` (`userId`, `months` 1–12) → `Guid`
  - `GET /admin/trainer-subscriptions` (paging, sort, `TrainerId`, `UserId`, `IsActive`)
  - `POST /admin/trainer-subscriptions/{id}/end`
  - `GET /admin/soldiers` (`Search`, 10 rows): only for the soldier autocomplete in the grant dialog
- Access (backend policy): `Policies.Admin`.
- Error codes handled: `Trainer.PriceNotSet`, `Trainer.NotFound`, `Trainer.PublishedPriceRequired`,
  `Trainer.PublishedCannotBeDeleted`, `Trainer.HasSubscriptions` (backend `messages`, toast),
  `TrainerSubscription.OtherTrainerActive`,
  `WorkoutPlan.TrainerProgramMissing`, `MealPlan.TrainerProgramMissing`; client side:
  `Trainer.DisplayNameEmpty`, `Trainer.InvalidCommissionPercent`, `User.InvalidUsername`, `TrainerSubscription.MonthsOutOfRange`, `UserId.Invalid`.
  `User.UsernameTaken` and `User.EmailTaken` show under the username or email field, not as a toast:
  `TrainersStore.takenAccount` keeps the refused value and the form schema marks the field invalid while
  it still holds that value (case and spaces ignored), so the same name cannot be sent twice.
  `IdentityProvider.RoleNotFound` shows the backend's own localized `messages` as a toast. In both cases
  the dialog stays open.
- The password field has a show/hide eye (`app-password-field`, `p-password` with `toggleMask`).
- Row actions (`TrainerRowActions`): edit, change password and change commission on every trainer; delete only on drafts (published trainers
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

## Structure notes
- The tabs are routed children of `TrainersPage`, so each tab has its own address and its own store
  (`TrainersStore`, `TrainerSubscriptionsStore`), provided by the child page.
- `TrainerSubscriptionsStore` loads the first 100 trainers for the trainer filter and the grant dialog.
- Granting is allowed from both tabs: from a trainer row the trainer is fixed, from the subscriptions
  tab it is chosen. Both stores prepare the grant with `createSubscriptionGrant`.
- Subscription status is derived: active when it was not ended and `endsOn` is later than now.
  The backend has one `endedOnUtc` for admin and expiry job, so "ended by admin" cannot be shown.
- The menu item uses a subset route match so it stays active on both tabs.
- Actions are never disabled in advance because of backend rules (price missing, programs missing,
  another trainer active); the server's refusal is shown as a toast.

- The grant dialog picks the user from `SoldierField` (an Optimus autocomplete wrapped as a form control).
  `SoldierSearchStore` is provided by each page; the dialog emits `soldierSearch` and the page forwards it.
  The dialog asks for the first 10 soldiers when it opens, and the field asks again on focus and on typing.
  Reading `/admin/soldiers` goes through `SoldierLookupService` with its own DTO, never the soldiers feature.

## Traps
- There is no endpoint to read one trainer, so there is no detail page.
- Valid `SortField` values for subscriptions are not documented in Swagger; the table sorts by
  `startsOnUtc` and `endsOnUtc` (sent as `starts_on_utc`, `ends_on_utc`); the trainers table sorts by `displayName`, `monthlyPrice`, `commissionPercent` (`commission_percent`) and `createdOnUtc`. Confirm with the backend.
- The maximum `Rows` of `GET /admin/trainers` is unknown; options for the filter and dialog use 100.
- The backend answers a bad commission with a plain `400`; its code is not documented, so the dialog and
  `requireCommissionPercent` check the range and the two decimals first and send only valid values.
- `GET /admin/payment-orders` also returns `commissionPercent` per order, but the panel has no payment
  orders screen yet.
- A trainer without a price stays a draft: only the trainer can set the price (`PUT /coach/profile`).
