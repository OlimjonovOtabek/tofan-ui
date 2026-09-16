# Foods feature

## Purpose
The admin keeps the food catalog: search by name or barcode, find a food by barcode (edit it if it
exists, otherwise open a create dialog with the barcode filled in), create, edit, delete.

## Backend
- Base route: `/diet/foods` (backend Diet module)
- Endpoints used: `GET /diet/foods` (paged, only `Search`), `GET /diet/foods/barcode/{barcode}`,
  `POST /diet/foods`, `PUT /diet/foods/{id}`, `DELETE /diet/foods/{id}`
- Access (backend policy): writes need `Policies.Admin`; `GET` needs authentication only
- Error codes handled: `Food.NotFound` (generic not-found message); a 404 from the barcode lookup
  means "not in the catalog" and becomes `null` in `FoodsService.findByBarcode`

## Screens
| Route | Page | Access |
|---|---|---|
| `/foods` | `pages/foods-page` | `authGuard` (admin role) |

## Structure notes
- `models/barcode.ts` trims the barcode and rejects a blank one before the request.
- `models/food-draft.ts` requires names in every language, a positive serving size and weight, and
  non-negative nutrition.
- `Food.per100Grams` normalises nutrition for the list; it is `null` when the serving weight is 0.

## Traps
- The backend list has no source or activity filter; do not add client-side filtering.
