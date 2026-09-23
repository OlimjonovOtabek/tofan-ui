# Garments feature

## Purpose
The admin manages NFC shirts: creates shirts one after another (model, colour, size, material,
manufacturing date) and gets the server-made serial number and the link to write to each chip, lists and filters shirts,
hides, revokes or restores a shirt, extends the validity of an activated shirt, and exports the chip
links of the filtered shirts to Excel for the print shop.

## Backend
- Base route: `/admin/garments` (backend Garment module, handover: `tofan/docs/garment-ui-v1.md`)
- Endpoints used: `GET /admin/garments` (paged, filters `SerialNumber` (ILIKE), `Status`, `OwnerId`),
  `POST /admin/garments`, `POST /admin/garments/{id}/status`, `POST /admin/garments/{id}/extend`,
  `GET /admin/garments/export-links` (same filters, no paging). The backend has no shirt photo,
  so the panel has none either (no upload field, no media category).
- Access (backend policy): `Policies.Admin` on every endpoint
- Error codes handled: `Garment.NotFound`, `Garment.ManufacturedInFuture`,
  `Garment.NotClaimed`, `Garment.StatusNotAllowed` (per-code messages in `core/feedback/error-message.ts`)

## Screens
| Route | Page | Access |
|---|---|---|
| `/garments` | `pages/garments-page` | `authGuard` (admin role) |

## Fields and serial number
- Model and material are free text (max. 200). Size is picked from `models/garment-catalog.ts`
  (`XS S M L XL 2XL 3XL`).
- Colour is a `#RRGGBB` code, picked with `shared/components/color-field` (a `p-colorpicker` next to
  a text input where the code can be typed or pasted). The form checks the pattern
  (`shared/utils/hex-color.ts`), `createGarmentDraft` upper-cases it. Older shirts may hold a word
  (`Qora`, `black`); the list shows the stored text as it is, with a swatch next to it (an unknown
  CSS colour leaves the swatch empty).
- The serial number is made by the server: a ULID (26 characters, Crockford base32), returned by
  `POST /admin/garments`. The panel never builds or checks a serial number; older shirts may still
  carry a `PT-…` serial. The created card shows it large with a copy button, for the shirt label.
- Batch entry: the create dialog stays open after a save. The fields are kept, the created card
  (serial number, link, token) is shown on top, so for the next shirt the admin only presses save.
  The form is cleared when the dialog is opened again. The dialog is `components/garment-form-dialog`;
  the card is `components/garment-created-panel`.

## Structure notes
- Clicking a row (or the serial number button, which is keyboard reachable) opens
  `components/garment-view-dialog`: every field of the row with a copy button each, the status tag,
  "copy all" as `Label: value` lines, and links to the soldier and account cards when the shirt has an
  owner. It needs no request: it shows the list row (`models/garment-details.ts` lists the fields).
  The row's own buttons stop the click, so they do not open it. The chip link is not shown because
  the list does not return it and there is no `GET /admin/garments/{id}`.
- The backend does not return the chip link in the list, only the token. The link is shown once, right
  after creation (`components/garment-created-panel`), and later only through the Excel export. The
  panel never builds a link itself: the host comes from the backend `Garment:PublicBaseUrl`.
- `GarmentStatus` (`inactive`, `active`, `hidden`, `revoked`) is the stored status. The admin can only
  set `active`, `hidden` or `revoked` (`AssignableGarmentStatus`); `Garment.statusChanges()` offers the
  ones that change something. `active` is "restore": the backend returns an unclaimed shirt to
  `inactive` and a claimed one to `active`, without extending the validity.
- Extension is offered only for claimed shirts (`Garment.canExtend()`); months are 1..24
  (`models/garment-extension.ts`). The response `data` is a plain ISO string, the new `expiresAt`.
- `export-links` is not a `Result` envelope but the `.xlsx` itself. `ApiClient.download` reads it as a
  blob, takes the name from `Content-Disposition` (fallback `garment-links.xlsx`) and turns a JSON
  error body back into a domain error; `core/feedback/FileDownloadService` saves it.
- `manufacturedAt` is a calendar day. The form works with a local date; the mapper sends that day as
  UTC midnight (`2026-08-14T00:00:00Z`, the backend needs the `Z`) and maps it back to the same local
  day (`shared/utils/calendar-date.ts`). The latest selectable day is the UTC day of now
  (`latestManufacturingDay`), because the backend compares UTC midnight with UTC now: between 00:00
  and 05:00 Tashkent time that is yesterday. The form defaults to that day.
- The status list shows `Tugagan` under the validity date when it has passed. This is display only;
  the NFC site uses the server's `isExpired`.
- Forms are Signal Forms. Optimus UI `p-select`, `p-datepicker` and `p-inputnumber` declare `min`,
  `max` and `pattern` inputs with types that clash with `FormUiControl`, so `[formField]` goes through
  `shared/components/select-field`, `date-field`, `number-field`, `choice-field` (a
  `p-selectbutton`, used for size), `color-field` and `text-field` (model and material, so an
  empty required field is not red before it is touched).
- Overlays (`p-datepicker`, `p-select`) are appended to `body` app-wide (`overlayAppendTo` in
  `core/config/ui.providers.ts`); inside a dialog they were clipped by the dialog content before.

- Texts are in `core/i18n/translations/{uz,ru,en}/garments.ts` (`garments.*` keys). Validator
  messages are keys too; `shared/components/field-error` translates them and fills `{maxLength}`,
  `{min}`, `{max}` from the validation error itself. The screen shows no explanatory hint texts.

## Traps
- The endpoints were not called against a running server when this screen was written (see the
  handover). Check each one in Swagger before relying on it.
- `SortField` must be the snake_case name of a response field; anything else silently sorts by `id`.
- A shirt dated today can be rejected with `Garment.ManufacturedInFuture` between 00:00 and 05:00
  Tashkent time: the backend compares UTC midnight of the day with UTC now. The panel no longer
  offers that day (see above); the real fix is a business-timezone check on the backend.
- The NFC site used to pick the shirt picture by the colour codes `black` / `blue`. New shirts carry a
  `#RRGGBB` code, so the NFC site has to handle that (or show no colour-based picture).
- Hidden and revoked shirts show `Invalid` on the NFC site, also to their owner.
- There is no delete, no regenerate-link, no batch create and no transfer on the backend; do not add
  them here without a backend endpoint.
