# Trainers feature

## Purpose
The admin registers trainers (a new Keycloak account, the `trainer` role and the card in one request), publishes or unpublishes them, grants a user a subscription to a
trainer and ends a subscription. One section, two tabs: "Trenerlar" and "Obunalar".
The trainer panel (`/coach/*`) is not part of this app.

## Backend
- Base routes: `/admin/trainers`, `/admin/trainer-subscriptions`; photo: `GET /files/{id}/content`.
- Endpoints used:
  - `POST /admin/trainers` (`username`, `email`, `phoneNumber?`, `password`, `displayName`) → card `Guid`.
    The backend opens the account and gives it the role; an existing account cannot be made a trainer.
  - `GET /admin/trainers` (paging, sort)
  - `POST /admin/trainers/{id}/publish`, `POST /admin/trainers/{id}/unpublish`
  - `POST /admin/trainers/{id}/subscriptions` (`userId`, `months` 1–12) → `Guid`
  - `GET /admin/trainer-subscriptions` (paging, sort, `TrainerId`, `UserId`, `IsActive`)
  - `POST /admin/trainer-subscriptions/{id}/end`
  - `GET /admin/soldiers` (`Search`, 10 rows): only for the soldier autocomplete in the grant dialog
- Access (backend policy): `Policies.Admin`.
- Error codes handled: `Trainer.PriceNotSet`, `Trainer.NotFound`, `TrainerSubscription.OtherTrainerActive`,
  `WorkoutPlan.TrainerProgramMissing`, `MealPlan.TrainerProgramMissing`; client side:
  `Trainer.DisplayNameEmpty`, `User.InvalidUsername`, `TrainerSubscription.MonthsOutOfRange`, `UserId.Invalid`.
  `User.UsernameTaken`, `User.EmailTaken` and `IdentityProvider.RoleNotFound` show the backend's own
  localized `messages`; the dialog stays open so the admin can change the field.
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
  `startsOnUtc` and `endsOnUtc` (sent as `starts_on_utc`, `ends_on_utc`); the trainers table sorts by `displayName`, `monthlyPrice` and `createdOnUtc`. Confirm with the backend.
- The maximum `Rows` of `GET /admin/trainers` is unknown; options for the filter and dialog use 100.
- A trainer without a price stays a draft: only the trainer can set the price (`PUT /coach/profile`).
