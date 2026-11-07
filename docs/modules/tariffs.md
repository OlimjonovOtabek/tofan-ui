# Tariffs feature

## Purpose

The admin reviews the three Tofan tariffs a Soldier can buy from Tofan itself (Free, Standard and VIP) on one page.
Each card shows the one price a Soldier pays per month (`totalPrice`), the limits in words, whether the AI trainer chat is included, and the Benefits in the admin's language.
The admin edits a tariff's monthly price, food scan limit, workout video limit, diet meal types, workout change months, diet change days and AI trainer chat.
The admin edits the Benefits of a tariff with the shared Benefits dialog (`docs/modules/benefits-dialog.md`), opened by the "Imtiyozlar" button on every card.

## Backend

- Base routes: `/tariffs` (read), `/admin/tariffs/{type}` (write).
- Endpoints used: `GET /tariffs` (any signed-in user, a `Result` list of tariffs), `PUT /admin/tariffs/{type}` (`1` Free, `2` Standard, `3` VIP) and `PUT /admin/tariffs/{type}/benefits`.
- Access (backend policy): `GET /tariffs` needs a token, the `PUT` is `Policies.Admin`.
- Error codes handled: `Tariff.FreeMustStayFree`, `Tariff.PaidPriceRequired`, `Tariff.NotFound`.
  Their texts live in `libs/core/src/i18n/translations/*/errors.ts` and `MESSAGES_BY_CODE` in `libs/core/src/feedback/error-message.ts`.
  `General.Validation` (negative limit, empty or unknown meal type list, a Benefit text that is empty or longer than 200 characters, more than 20 Benefits) arrives with `errors[]` and shows the issue messages.

## Screens

| Route      | Page                                | Access                   |
| ---------- | ----------------------------------- | ------------------------ |
| `/tariffs` | `pages/tariffs-page` (`TariffsStore`) | `authGuard` (admin role) |

The menu item "Tofan tariflari" sits in the "Narxlar" group (`layout.menu.pricing`, `layout.menu.tariffs`), which the Platform fee page shares.

## Structure notes

- `services/tariffs.service.ts` has `list()`, `change(type, draft)` and `changeBenefits(type, benefits)`.
  `list()` sorts by type (Free, Standard, VIP) in `toTariffs`, so the card order never depends on the response order.
- The tariff type is a union type in `models/`.
  Its DTO enum (`TariffType` 1 to 3) lives in `services/tariff.dto.ts` and `enumMap` in `services/tariff.mapper.ts` maps it by name.
  The member must be `Vip`, not `VIP`, because `enumMap.toApi('vip')` capitalizes the first letter only.
- The meal type (`MealType` 1 to 7) is shared with the Coach panel, so it lives in `libs/shared/src/models`:
  `meal-type.ts` (union and `MEAL_TYPES`), `meal-type.dto.ts` (`MealTypeDto` and the `mealTypes` enum map) and `meal-type-labels.ts` (`MEAL_TYPE_LABELS`, `MEAL_TYPE_OPTIONS`, the `enums.mealType.*` texts).
  The tariff DTO uses `MealTypeDto` and the mapper uses `mealTypes`.
- The backend sends a Benefit as `{ name, nameRu, nameUz }` without an id.
  The mapper turns it into the shared `Benefit` model from `libs/shared` (`name` is the English text) and the card shows `pickLocalized` in the admin's language.
  `toChangeTariffBenefitsRequest` maps the other way, so the request body is `{ benefits: [{ name, nameRu, nameUz }] }` in the order of the list.
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
- The card shows only `totalPrice`, as the backend sent it, with a note that no commission, tax or provider fee is added.
  Since the 2026-11-05 backend decision a Tofan tariff has no Platform fee, so `totalPrice` always equals `monthlyPrice` and a second price row would only repeat it.
  The panel never works the total out itself.
- Benefits are edited by the shared `app-benefits-dialog`, used unchanged.
  The "Imtiyozlar" button of a card emits `editBenefits`, the page remembers the tariff type, passes that tariff's Benefits to the dialog and then opens it.
  The dialog emits the whole ordered list, `TariffsStore.changeBenefits(type, benefits)` sends it in one request, raises the `tariffs.toast.benefitsSaved` toast and reloads the list, so the card shows the backend's list.
  The page closes the dialog only when the store returns `true`; on a refusal the dialog stays open with the typed rows and the error toast.
- `change` and `changeBenefits` share one private `write` method in the store (saving flag, toast, reload, error toast).

## Traps

- `PUT /admin/tariffs/{type}` needs all seven fields every time.
  A missing key becomes `null` and the backend removes that limit.
  `tariffs.service.spec.ts` proves the body has seven keys with `null` limits kept.
- `0` is a valid food scan limit and means scan is closed, so never treat it as empty (`required` is fine, `||` is not).
- The limit minimums come from the backend hand-off, not from Swagger: scan and video `>= 0`, change months and change days `>= 1`.
- `workoutVideoLimit` counts exercises over the whole plan, not per day (backend `docs/tariffs-v1.md`, "Videolar").
  The first N exercises with a video, in day and exercise order, keep their video; an exercise repeated on another day counts once.
  `null` opens every video and `0` closes every video, so `0` has its own card text ("Hamma video yopiq") like the scan limit.
- On release day the Free video and meal limits may have to be switched off until the new mobile version ships.
  It is a data step in this page, not code: follow `docs/release-day.md`.
- `GET /tariffs` answers 401 without a token, so the page relies on the session interceptor like every other screen.
- `PUT /admin/tariffs/{type}/benefits` replaces the whole list, so an empty list removes every Benefit of that tariff.
  A Benefit has no id, so the dialog sends every row again, including the ones the admin did not touch.
- Benefits are plain text and do not follow limit changes.
  After changing a limit, edit the line that mentions it by hand (the dialog shows this warning).
