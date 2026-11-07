# Tariffs feature

## Purpose

The admin reviews the three Tofan tariffs a Soldier can buy from Tofan itself (Free, Standard and VIP) on one page.
Each card shows the monthly price, the total price a Soldier pays, the limits in words, whether the AI trainer chat is included, and the Benefits in the admin's language.
The admin edits a tariff's monthly price, food scan limit, workout video limit, diet meal types, workout change months, diet change days and AI trainer chat.
The Benefits are shown read-only here.
They are edited with the shared Benefits editor (a later ticket of the stage v1 spec), not on this page.

## Backend

- Base routes: `/tariffs` (read), `/admin/tariffs/{type}` (write).
- Endpoints used: `GET /tariffs` (any signed-in user, a `Result` list of tariffs), `PUT /admin/tariffs/{type}` (`1` Free, `2` Standard, `3` VIP).
- Access (backend policy): `GET /tariffs` needs a token, the `PUT` is `Policies.Admin`.
- Error codes handled: `Tariff.FreeMustStayFree`, `Tariff.PaidPriceRequired`, `Tariff.NotFound`.
  Their texts live in `libs/core/src/i18n/translations/*/errors.ts` and `MESSAGES_BY_CODE` in `libs/core/src/feedback/error-message.ts`.
  `General.Validation` (negative limit, empty or unknown meal type list) arrives with `errors[]` and shows the issue messages.

## Screens

| Route      | Page                                | Access                   |
| ---------- | ----------------------------------- | ------------------------ |
| `/tariffs` | `pages/tariffs-page` (`TariffsStore`) | `authGuard` (admin role) |

The menu item "Tofan tariflari" sits in the "Narxlar" group (`layout.menu.pricing`, `layout.menu.tariffs`), which the Platform fee page shares.

## Structure notes

- `services/tariffs.service.ts` has `list()` and `change(type, draft)`.
  `list()` sorts by type (Free, Standard, VIP) in `toTariffs`, so the card order never depends on the response order.
- The tariff type and the meal type are union types in `models/`.
  The DTO enums (`TariffType` 1 to 3, `MealType` 1 to 7) live in `services/tariff.dto.ts` and `enumMap` in `services/tariff.mapper.ts` maps them by name.
  The member must be `Vip`, not `VIP`, because `enumMap.toApi('vip')` capitalizes the first letter only.
  The admin has its own meal type code here because apps cannot import each other (the Coach panel has its own copy).
- The backend sends a Benefit as `{ name, nameRu, nameUz }` without an id.
  The mapper turns it into a `LocalizedText` (`name` is the English text) and the card shows `pickLocalized` in the admin's language.
- `models/tariff-draft.ts` is the write model and `createTariffDraft(type, draft)` is the rule set the store applies:
  Free price must be 0 (`Tariff.FreeMustStayFree`), Standard and VIP price must be above 0 (`Tariff.PaidPriceRequired`), scan and video limits are whole numbers from 0, change months and change days are whole numbers from 1, a limited meal type list is not empty.
- `models/tariff-limits.ts` turns a tariff into the six rows of words on the card ("Cheksiz", "Oyiga 15 ta", "Scan yopiq", "Hamma ovqat ochiq", "Almashmaydi", ...).
- `components/tariff-form-dialog` is a Signal Forms dialog.
  `tariff-form.schema.ts` holds the form value, `tariffFormValue(tariff)` (tariff to form), `toTariffDraft(value, type)` (form to draft) and the schema.
- Every nullable limit has a toggle ("Cheksiz", "Hammasi ochiq", "Hamma ovqat ochiq", "Almashmaydi").
  A switched-on toggle disables its number field (`disabled(path, { when })`), removes the field from validation and becomes `null` in the draft, whatever number was typed before.
  A switched-off toggle with an empty number blocks the save, because `null` would silently remove the limit.
- Meal types use `shared/components/multiselect-field` (an Optimus `p-multiselect` wrapper).
  The draft lists the chosen meal types in the fixed `MEAL_TYPES` order.
- The Free price field is disabled and the draft sends 0 whatever the field holds.
- The total price is never edited.
  After a save the store reloads the list, so the total price and the limits on the cards are the backend's.

## Traps

- `PUT /admin/tariffs/{type}` needs all seven fields every time.
  A missing key becomes `null` and the backend removes that limit.
  `tariffs.service.spec.ts` proves the body has seven keys with `null` limits kept.
- `0` is a valid food scan limit and means scan is closed, so never treat it as empty (`required` is fine, `||` is not).
- The limit minimums come from the backend hand-off, not from Swagger: scan and video `>= 0`, change months and change days `>= 1`.
- The video limit unit is not documented; the card says "N ta video ochiq".
  Check the wording with the backend if the unit turns out to be different.
- `GET /tariffs` answers 401 without a token, so the page relies on the session interceptor like every other screen.
