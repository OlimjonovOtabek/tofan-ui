# Foods feature

## Purpose

The admin keeps the food catalog: search by name or barcode, find a food by barcode (edit it if it
exists, otherwise open a create dialog with the barcode filled in), create, edit, delete.

## Backend

- Base route: `/diet/foods` (backend Diet module)
- Endpoints used: `GET /diet/foods` (paged; `Search`, `Source`, `IsActive`, `IsVerified`), `GET /diet/foods/barcode/{barcode}`,
  `POST /diet/foods`, `PUT /diet/foods/{id}`, `DELETE /diet/foods/{id}`
- Access (backend policy): writes need `Policies.Admin`; `GET` needs authentication only
- Error codes handled: `Food.NotFound` (generic not-found message); a 404 from the barcode lookup
  means "not in the catalog" and becomes `null` in `FoodsService.findByBarcode`

## Screens

| Route    | Page               | Access                   |
| -------- | ------------------ | ------------------------ |
| `/foods` | `pages/foods-page` | `authGuard` (admin role) |

## Structure notes

- `models/barcode.ts` trims the barcode and rejects a blank one before the request.
- `models/food-draft.ts` requires names in every language, a positive serving size and weight, and
  non-negative nutrition.
- `Food.per100Grams` normalises nutrition for the list; it is `null` when the serving weight is 0.

## Traps

- `IsActive` has no "both" value: when omitted the backend returns active foods only. The filter
  therefore offers "Faol" / "O‘chirilgan" (default "Faol", no clear button) and always sends it.
- The list shows custom foods the signed-in admin created (`isMine`), never other users' ones.
