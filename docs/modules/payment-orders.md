# Payment orders feature

## Purpose

The admin sees every payment order (Trainer subscriptions and Tofan tariffs) on one server-paged page, with the price and each amount added on top of it.
It answers "did this user pay, how much, for what and through which provider".
The page only reads; creating an order by hand waits for the backend answers in `docs/backend-requests.md` ("To'lov buyurtmalari").
It is one page in the "Narxlar" menu group, next to Tofan tariffs and Platform fee.

## Backend

- Base route: `/admin/payment-orders`
- Endpoints used: `GET /admin/payment-orders` with `First`, `Rows`, `SortField`, `SortOrder`, `Status`, `UserId`, `ReferenceId`.
  It answers a bare paged list `{ data, totalCount }`, not a `Result` envelope.
- Not used yet: `POST /admin/payment-orders` (`userId`, `purpose`, `referenceId`, `price`); its meaning is an open backend question.
- Access (backend policy): `Policies.Admin`
- Error codes handled: none by code; a failed load shows the backend message with a retry button.
- Contract source: stage Swagger and `admin-ui-platform-fee-v1.1.md` (section 2).

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
- Backend enums: `PaymentOrderStatus` 1 Pending, 2 Paid, 3 Refunded; `PaymentPurpose` 1 TrainerSubscription, 2 Tariff; `PaymentProvider` 1 Payme, 2 Click; `SubscriptionTier` comes from `shared/models/tier.dto.ts`.

## Traps

- The response has no user, trainer or tariff names.
  Do not add a lookup per row; the names are requested from the backend (`userName`, `referenceName`).
- `SortField` values the backend does not know are ignored silently (the list comes back unsorted, not 400), so keep the column `field` names equal to the response properties.
- Stage holds old tariff orders with a commission and a provider fee, made before the 2026-11-05 decision; the page shows the backend's numbers as they are and never recalculates them.
