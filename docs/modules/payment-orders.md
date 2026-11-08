# Payment orders feature

## Purpose

The admin sees every payment order (Trainer subscriptions and Tofan tariffs) on one server-paged page, with the price and each amount added on top of it.
It answers "did this user pay, how much, for what and through which provider".
The admin can also open a Pending Trainer subscription order by hand for a user, with a price the admin chooses.
It is one page in the "Narxlar" menu group, next to Tofan tariffs and Platform fee.

## Backend

- Base route: `/admin/payment-orders`
- Endpoints used: `GET /admin/payment-orders` with `First`, `Rows`, `SortField`, `SortOrder`, `Status`, `UserId`, `ReferenceId`.
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
- Open questions (what the endpoint is for, how the user finds and pays the order, VIP, validation) are in `docs/backend-requests.md` ("To'lov buyurtmalari").

## Screens

| Route             | Page                                               | Access                   |
| ----------------- | -------------------------------------------------- | ------------------------ |
| `/payment-orders` | `pages/payment-orders-page` (`PaymentOrdersStore`) | `authGuard` (admin role) |

## Structure notes

- Columns: created, user ID (link to `/soldiers/:userId`), purpose with the reference ID under it, price, commission, tax (with its percent), provider fee (with its percent), total, status.
  A paid order shows the paid date and Click or Payme under the status; a refunded one shows the refund date.
- The newest orders come first (`created_on_utc` descending); price, commission, tax, provider fee and total sort on the server too.
- `components/payment-order-filters` holds the status select and the user and reference ID fields.
  An ID field emits only a full UUID (debounced), and shows a hint while the text is a partial ID, the same way as the Trainer subscriptions filters.
  `PaymentOrdersStore.applyFilter` goes back to the first page and keeps the sort.
- The page turns each order into a row of ready strings in one `computed`, so the template has no formatting calls.
  Money uses `Intl.NumberFormat` with the admin locale and the `paymentOrders.money` text (`so'm`, `UZS`, `сум`).
- `toPaymentOrder` keeps `tier` only for a Trainer subscription: the backend sends `tier: 1` on tariff orders too, and it means nothing there.
- `components/payment-order-create-dialog` is a Signal Forms dialog: trainer (`SelectField`), user (shared `SoldierField`) and price (`NumberField`, no fraction digits).
  The trainer comes first on purpose: the dialog focuses its first field when it opens, and a focused `SoldierField` opens its suggestion list over the rest of the form, where a stray click picks a user.
  When a trainer is chosen it shows the trainer's Standard price with a "use this price" link; the admin can type a different one.
  An info message says the order is a Pending Standard subscription, the Platform fee is added on top and only the user can pay it.
- `createPaymentOrderDraft` (in `models/payment-order-draft.ts`) trims both IDs, checks they are UUIDs and that the price is a positive whole number before the store calls the service.
- `PaymentOrdersStore.create` shows "order created for <trainer>" and reloads the first page with the current filter and sort, so the new order is on top under the default sort.
  The trainers load each time the dialog opens; a failure shows a hint under the trainer select.
- The page provides `SoldierSearchStore` from `libs/shared/src/components/soldier-field`, shared with the trainers feature.
- Backend enums: `PaymentOrderStatus` 1 Pending, 2 Paid, 3 Refunded; `PaymentPurpose` 1 TrainerSubscription, 2 Tariff; `PaymentProvider` 1 Payme, 2 Click; `SubscriptionTier` comes from `shared/models/tier.dto.ts`.

## Traps

- The response has no user, trainer or tariff names.
  Do not add a lookup per row; the names are requested from the backend (`userName`, `referenceName`).
- `SortField` values the backend does not know are ignored silently (the list comes back unsorted, not 400), so keep the column `field` names equal to the response properties.
- Stage holds test orders made by the probe above: two for the "Probe User" soldier (price 1 000.5, and one for a trainer ID that does not exist) and one for the `stage-admin` account (price 1 000).
  Orders cannot be deleted through the API; ask the backend to remove them if they get in the way.
  The order opened from the dialog in the browser check (Stage Coach, 200 000, soldier "Otabek Olimjonov") is kept on purpose: that account can sign in to the mobile app.
- Stage holds old tariff orders with a commission and a provider fee, made before the 2026-11-05 decision; the page shows the backend's numbers as they are and never recalculates them.
