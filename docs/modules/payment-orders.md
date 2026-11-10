# Payment orders feature

## Purpose

The admin sees every payment order (Trainer subscriptions and Tofan tariffs) on one server-paged page, with the price and each amount added on top of it.
It answers "did this user pay, how much, for what and through which provider".
The admin can also open a Pending Trainer subscription order by hand for a user, with a price the admin chooses.
That endpoint is temporary and exists only for the Click and Payme sandbox test (backend answer, 2026-11-08): the admin hands the order ID to the test checkout without signing in as the payer, and the order never shows in the app.
It is one page in the "Narxlar" menu group, next to Tofan tariffs and Platform fee.

## Backend

- Base route: `/admin/payment-orders`
- Endpoints used: `GET /admin/payment-orders` with `First`, `Rows`, `SortField`, `SortOrder`, `Search`, `Status`, `Purpose`, `PaidWith`, `ReferenceId`, `CreatedFrom`, `CreatedTo` (API v9.20, `admin-ui-table-names-v1.md`).
  Each row also carries `userFullName`, `userName` and `referenceName` (trainer `displayName`, or the tariff kind for a tariff); all three may be `null`.
  It answers a bare paged list `{ data, totalCount }`, not a `Result` envelope.
- `POST /admin/payment-orders` with `userId`, `purpose`, `referenceId`, `price`; answers `Result<Guid>` (the new order id).
- `GET /admin/trainers` (`First` 0, `Rows` 100) through `TrainerOptionsService` with its own DTO, only for the trainer select of the create dialog.
- `GET /admin/soldiers` (`Search`, 10 rows) through the shared `SoldierLookupService`, only for the user autocomplete.
- Access (backend policy): `Policies.Admin`
- Error codes handled: none by code; a failed load shows the backend message with a retry button, a refused create shows the backend message in a toast and keeps the dialog open.
- Contract source: stage Swagger, `admin-ui-platform-fee-v1.1.md` (section 2) and the stage probe below.

## What `POST /admin/payment-orders` does (stage probe, 2026-11-08)

The backend has not described the endpoint, so it was tried on stage with test accounts.

- The order opens as `Pending`; nothing is paid or granted by the call itself.
- `purpose` must be `TrainerSubscription`: `Tariff` is refused with `General.Validation` (`'Purpose' must not be equal to 'Tariff'`), which matches "the admin cannot give a tariff by hand".
- `price` is the base price.
  The current Platform fee is added on top exactly like a user's own order: `price` 1 000 with commission 50 000, tax 0% and provider 2% gave provider fee 1 020 and `amount` 52 020.
- `tier` is not in the body; the order is always `Standard` (`tier: 1`).
- `price` must be above 0 (`GreaterThanValidator`), but a fraction such as 1 000.5 is accepted and stored, so the panel only sends whole so'm.
- `referenceId` is not checked: a random UUID made an order for a trainer that does not exist.
  This is why the dialog picks the trainer from `GET /admin/trainers` instead of taking a typed ID.
- `userId` existence was not tried, to avoid one more orphan order; the dialog picks the user from the Soldier search anyway.
- Only the owner can pay: `GET /payment-orders/{id}` and the Click and Payme checkout links answer `PaymentOrder.NotFound` for an admin who is not the order's user.
  On stage both checkout links answer `Click.NotConfigured` and `Payme.NotConfigured`.
- Backend answer (2026-11-08): the endpoint is a temporary sandbox tool, so the panel spends no more work on the dialog.
  The payment goes through only when `price` equals the trainer's current price; a wrong `referenceId` moves no money, because the provider check asks for the trainer before the payment (`-31008`).
  The unchecked IDs, the 2-digit fraction and the missing `tier` are confirmed and stay as they are unless the endpoint becomes permanent.
  Details are in `docs/backend-requests.md` ("To'lov buyurtmalari").

## Screens

| Route             | Page                                               | Access                   |
| ----------------- | -------------------------------------------------- | ------------------------ |
| `/payment-orders` | `pages/payment-orders-page` (`PaymentOrdersStore`) | `authGuard` (admin role) |

## Structure notes

- Columns: created with the order ID under it (the ID the sandbox checkout needs), payer (full name with the username under it, link to `/soldiers/:userId`, the short ID when the payer has no profile), purpose with the trainer name under it, price, commission, tax (with its percent), provider fee (with its percent), total, status.
- `toPaymentOrderReference` decides the line under the purpose: the trainer name for a subscription, nothing for a tariff (the tier already names the kind), the short reference ID when the name is missing.
  A paid order shows the paid date and Click or Payme under the status; a refunded one shows the refund date.
- The newest orders come first (`created_on_utc` descending); price, commission, tax, provider fee and total sort on the server too.
- `components/payment-order-filters` holds the search (payer name or username), status, purpose, trainer, payment system and created date range (`app-date-range-field`, the period ends before the next day).
  The trainer list comes from `TrainerOptionsService`, loaded once when the page opens and reused by the create dialog.
  `toPaymentOrderTarget` sends a chosen trainer as `ReferenceId` with `Purpose=1` (there is no `TrainerId` filter); the purpose select is disabled while a trainer is chosen.
  `PaymentOrdersStore.applyFilter` goes back to the first page and keeps the sort.
- The page turns each order into a row of ready strings in one `computed`, so the template has no formatting calls.
  Money uses `Intl.NumberFormat` with the admin locale and the `paymentOrders.money` text (`so'm`, `UZS`, `сум`).
- `toPaymentOrder` keeps `tier` for both purposes.
  On a tariff order it is the tariff kind (VIP tariff `2`, every other tariff `1`) and the backend grants that subscription tier after the payment, so the row reads "Tofan tarifi · Standard" or "Tofan tarifi · VIP".
- `components/payment-order-create-dialog` is a Signal Forms dialog: trainer (`SelectField`), user (shared `SoldierField`) and price (`NumberField`, no fraction digits).
  The trainer comes first on purpose: the dialog focuses its first field when it opens, and a focused `SoldierField` opens its suggestion list over the rest of the form, where a stray click picks a user.
  When a trainer is chosen it shows the trainer's Standard price with a "use this price" link; the admin can type a different one.
  A trainer whose Standard price is not set yet (0) gets no hint, because 0 is not a valid order price.
  The trainer list is the first 100 trainers (`TRAINER_OPTIONS_LIMIT`); raise it or add a search when the platform has more.
  An info message says the order is a temporary sandbox order (Pending, Standard, not shown in the app), the Platform fee is added on top, it is paid in the test checkout by its ID, and the payment goes through only at the trainer's current Standard price.
- `createPaymentOrderDraft` (in `models/payment-order-draft.ts`) trims both IDs, checks they are UUIDs and that the price is a positive whole number before the store calls the service.
- `PaymentOrdersStore.create` shows "order created for <trainer>" with the new order ID from the response and reloads the first page with the current filter and sort, so the new order is on top under the default sort.
  The trainers load each time the dialog opens; a failure shows a hint under the trainer select.
- The page provides `SoldierSearchStore` from `libs/shared/src/components/soldier-field`, shared with the trainers feature.
- Backend enums: `PaymentOrderStatus` 1 Pending, 2 Paid, 3 Refunded; `PaymentPurpose` 1 TrainerSubscription, 2 Tariff; `PaymentProvider` 1 Payme, 2 Click; `SubscriptionTier` comes from `shared/models/tier.dto.ts`.

## Traps

- The names come in the list response; never add a lookup per row.
- There is no `userPhoneNumber` and no phone search: the phone lives in Keycloak, open the account page for it.
- Do not make the payer or reference columns sortable: `SortField` with `userFullName`, `userName` or `referenceName` is ignored and the list falls back to `createdOnUtc`.
- `SortField` values the backend does not know are ignored silently (the list comes back unsorted, not 400), so keep the column `field` names equal to the response properties.
- Orders cannot be deleted through the API; the backend removed the three probe orders on 2026-11-08 and keeps a CSV copy.
  The order opened from the dialog in the browser check (Stage Coach, 200 000, soldier "Otabek Olimjonov") is kept on purpose: that account can sign in to the mobile app.
- Stage holds three old tariff orders (total 173 400) with a commission and a provider fee, made before the change reached stage (2026-11-05 13:00 UTC, API `v9.15`); the page shows the backend's numbers as they are and never recalculates them.
