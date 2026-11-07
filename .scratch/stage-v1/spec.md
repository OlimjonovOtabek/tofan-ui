Status: ready-for-agent

# Stage v1: Tier, Tofan Tariff'lari, Benefit'lar va Platform fee

Manba: backend hujjati `angular-stage-v1.md` (2026-11-05), `admin-ui-platform-fee-v1.md` (2026-10-21), stage Swagger, Flutter `tofan_trainer` `origin/dev` va grilling (2026-11-07).
Atamalar `CONTEXT.md` dagi lug'atga mos.

## Problem Statement

Backend stage serverga Trainer subscription'ning Tier'ini (Standard, VIP), Tofan Tariff'larini, Benefit'larni va global Platform fee'ni chiqardi.
Admin paneli va Coach panel bularni bilmaydi.
Admin Tariff narxlari, limitlari va Benefit'larini, Tier Benefit'larini va Platform fee'ni o'zgartira olmaydi, obunada Tier'ni ko'rmaydi va almashtira olmaydi.
Eski Trainer formalari VIP price'ni yubormaydi, shuning uchun admin yoki Trainer profilni har saqlaganda VIP price jimgina o'chadi.
Trainer VIP price qo'ya olmaydi, Client'ning Tier'ini ko'rmaydi, chatning read-only matni esa "obuna tugagan" deydi, garchi Client shunchaki Standard'da bo'lishi mumkin bo'lsa ham.
Admin'dagi Trainer komissiyasi foizi olib tashlangan endpoint'ni chaqiradi va 404 beradi.
Lokal staging proxy yopilgan eski serverga qaraydi.

## Solution

Panellar stage API bilan ishlaydi va yangi imkoniyatlarni to'liq ko'rsatadi.
Admin yangi "Narxlar" bo'limida Tofan Tariff'larini va Platform fee'ni boshqaradi.
Trenerlar bo'limida Tier Benefit'lari tabi paydo bo'ladi.
Obunalar jadvalida Tier ko'rinadi va almashtiriladi.
Trainer formasi va Coach panel profili VIP price'ni har doim saqlaydi, shuning uchun u hech qachon jimgina o'chmaydi.
Coach panelda Client'ning VIP belgisi ko'rinadi, chat esa faqat faol VIP Client bilan ochiladi va boshqa hollarda tushunarli izoh beradi.
Ishlar stage'da sinaladi, `main`ga qo'shiladi va prod'ga faqat reliz kuni birga chiqadi.

## User Stories

### Stage

1. As a developer, I want the staging dev server to proxy to the stage API, so that I can test the new screens against the backend that has the new endpoints.
2. As a developer, I want the staging proxy to forward WebSocket traffic, so that the coach chat hub works against stage.
3. As a developer, I want the project docs to name the stage server instead of the closed old server, so that nobody follows a dead address.

### VIP price (admin)

4. As an admin, I want to see each Trainer's VIP price in the Trainers list, so that I know who sells VIP.
5. As an admin, I want a Trainer without a VIP price to show an empty VIP cell, so that I can tell Standard-only Trainers apart.
6. As an admin, I want an optional "VIP narxi" field in the Trainer edit form, so that I can set or change a Trainer's VIP price.
7. As an admin, I want the VIP price field prefilled with the current value, so that saving other fields keeps it.
8. As an admin, I want editing a Trainer's name, bio, photo, email, phone or price to keep their VIP price, so that I never wipe VIP by accident.
9. As an admin, I want clearing the VIP price field to stop the Trainer selling VIP, so that I can turn VIP off on purpose.
10. As an admin, I want the form to refuse a VIP price of zero or below, so that I do not send a value the backend rejects.
11. As an admin, I want the form to explain that an empty VIP price means Standard only, so that the field's meaning is clear.

### VIP price (Coach panel)

12. As a Trainer, I want an optional VIP price field on the pricing page, so that I can sell the VIP Tier.
13. As a Trainer, I want a note explaining that VIP Clients can chat with me and that clearing VIP keeps chat for current VIP Clients until their subscription ends, so that I understand the effect.
14. As a Trainer, I want the pricing page to refuse a VIP price of zero, so that I see the problem before saving.
15. As a Trainer, I want my profile to show "200 000 so'm · VIP 400 000" when I sell VIP, so that I see both prices at a glance.
16. As a Trainer, I want editing my name, bio, link or photo to keep my VIP price, so that VIP never turns off silently.
17. As a Trainer, I want clearing the VIP price to stop new VIP sales, so that I can sell Standard only.

### Platform fee (admin)

18. As an admin, I want a Platform fee page, so that I can see the commission, tax and payment provider fee Tofan adds to prices.
19. As an admin, I want to see the currency next to the commission amount, so that I know what unit it is in.
20. As an admin, I want to change the commission amount, tax percent and provider fee percent, so that pricing follows business decisions.
21. As an admin, I want the form to refuse a negative commission, a percent outside 0 to 100, and more than two decimals, so that I only send valid values.
22. As an admin, I want a note that a change affects only payments opened after it, so that I am not surprised by older payments.
23. As an admin, I want to confirm before saving the Platform fee, so that I do not change every price by a slip.
24. As an admin, I want a clear message when loading or saving fails, with a retry for loading, so that I know what happened.
25. As an admin, I no longer want the per-Trainer commission column, sort, button and dialog, so that I am not offered an action that cannot work.

### Tofan Tariffs (admin)

26. As an admin, I want a "Tofan tariflari" page listing Free, Standard and VIP in that order, so that I can review all Tariffs at once.
27. As an admin, I want each Tariff card to show the monthly price and the total price a Soldier pays, so that I see the effect of the Platform fee.
28. As an admin, I want each Tariff card to describe its limits in words ("Cheksiz", "Oyiga 15 ta", "Hamma ovqat ochiq", "Almashmaydi"), so that I can read them without decoding numbers.
29. As an admin, I want each Tariff card to show whether the AI trainer chat is included, so that I see the full offer.
30. As an admin, I want each Tariff card to list its Benefits in my language, so that I see what Soldiers read.
31. As an admin, I want to edit a Tariff's monthly price, food scan limit, workout video limit, diet meal types, workout change months, diet change days and AI trainer chat, so that I can shape each Tariff.
32. As an admin, I want a toggle per nullable limit that means "no limit" or "never changes", so that I can remove a limit without typing a magic number.
33. As an admin, I want the number field disabled while its toggle is on, so that it is clear no limit is sent.
34. As an admin, I want to choose diet meal types from a list or switch on "Hamma ovqat ochiq", so that I can open some or all meal types.
35. As an admin, I want the form to require at least one meal type when the toggle is off, so that I do not send an empty list.
36. As an admin, I want a food scan limit of zero to be allowed and explained as "scan yopiq", so that I can close scanning on a Tariff.
37. As an admin, I want the Free Tariff's price locked at zero with a "Free doim bepul" hint, so that I cannot try to charge for Free.
38. As an admin, I want the form to require a price above zero for Standard and VIP, so that paid Tariffs stay paid.
39. As an admin, I want every field sent on save, so that no limit is removed because a field was left out.
40. As an admin, I want backend Tariff errors shown as clear text, so that I understand a refusal.
41. As an admin, I want the Tariff list to refresh after a save, so that the total price and limits I see are the backend's.

### Benefits (admin, shared by Tariffs and Tiers)

42. As an admin, I want to open a Benefits editor for a Tariff or a Tier, so that I can change what Soldiers read about it.
43. As an admin, I want each Benefit row to have English, Russian and Uzbek text, so that every app language is covered.
44. As an admin, I want all three texts required and at most 200 characters, so that I do not save a Benefit the backend rejects.
45. As an admin, I want to add a Benefit, up to 20, so that I can describe the offer fully.
46. As an admin, I want to remove a Benefit, so that I can drop an outdated line.
47. As an admin, I want to reorder Benefits by dragging, so that the most important line comes first.
48. As an admin, I want up and down buttons for each Benefit, so that I can reorder with the keyboard.
49. As an admin, I want the saved order to match the order I see, so that Soldiers read them the same way.
50. As an admin, I want a warning that Benefits are plain text and do not follow limit changes, so that I remember to update "Oyiga 15 marta" after changing a limit.
51. As an admin, I want the same Benefits editor for Tariffs and Tiers, so that I learn it once.

### Tier Benefits and Trainer subscriptions (admin)

52. As an admin, I want a "Darajalar" tab in Trainers showing Standard and VIP with their Benefits, so that I can manage the Tier offer for all Trainers.
53. As an admin, I want to edit each Tier's Benefits with the shared editor, so that both Tiers are described consistently.
54. As an admin, I want a Tier column in the Trainer subscriptions table, so that I see who is VIP.
55. As an admin, I want a "VIP qilish" or "Standard qilish" action on active subscriptions, so that I can change a Client's Tier without changing the dates.
56. As an admin, I want to confirm a Tier change, so that I do not switch someone by a slip.
57. As an admin, I want no Tier action on ended subscriptions, so that I am not offered something the backend refuses.
58. As an admin, I want a clear message when a subscription is not found or not active, so that I understand a refusal.
59. As an admin, I want the grant dialog to say that it opens a Standard subscription and VIP is given from the table, so that I know how to give VIP.

### Clients and chat (Coach panel)

60. As a Trainer, I want a VIP tag next to VIP Clients in my Clients list, so that I see who can chat with me.
61. As a Trainer, I want a VIP tag on a VIP Client's page, so that I see their Tier there too.
62. As a Trainer, I want the "Xabar yozish" button only for active VIP Clients, so that I am not sent into a chat I cannot write in.
63. As a Trainer, I want a read-only conversation to say that chat is open only to active VIP subscribers, so that I understand why I cannot write.
64. As a Trainer, I want an existing conversation with a Standard Client to keep its history readable, so that I can still look back.
65. As a Trainer, I want opening a chat that the backend refuses for Tier reasons to show the read-only note instead of an error, so that the screen stays calm.
66. As a Trainer, I want a send refused for Tier reasons to switch the conversation to read-only with a clear toast, so that I know the Client lost VIP.
67. As a Trainer, I want my unsent text kept when a send is refused, so that I do not lose what I typed.

## Implementation Decisions

- Work ships as one PR per ticket in `issues/`, in dependency order; every ticket is blocked by the stage proxy ticket because its E2E runs against stage.
- Each PR merges into `main` of the fork after checks and stage E2E; `main` goes to stage, prod panels get nothing before the release day.
- The staging proxy points at the stage API and forwards WebSockets.
- Two new admin features: `tariffs` and `platform-fee`, each with its own routes, service, store, DTO and mapper, under a new "Narxlar" menu group.
- Tier Benefits live in the existing `trainers` feature as a third tab next to Trainers and Subscriptions.
- The Tier lives in `libs/shared` as a domain union (`standard`, `vip`) with a DTO enum (`1`, `2`) and an enum map, because the admin `trainers` feature and the Coach panel both use it and features cannot import each other.
- The Benefit lives in `libs/shared` as a model with three texts and the limits (200 characters, 20 rows); each feature keeps its own Benefit DTO and maps it.
- The Benefits editor is one shared dialog built on the existing form dialog, using Signal Forms with an array schema, CDK drag-and-drop with a handle and up and down buttons; it takes the current Benefits and a saving flag and emits the ordered list; the page and store do the write.
- The Trainer edit form gains an optional VIP price; the edit draft and the update request carry `vipMonthlyPrice` as a number or `null`, always present in the request body.
- The Coach profile change and update request always carry `vipMonthlyPrice`; every Coach panel save (name, bio, link, photo, prices) passes the current VIP price through.
- The Coach pricing page gains the VIP price field and note from the Flutter app; the profile price label appends "VIP {price}" when set.
- Tariff contract: `GET /tariffs` returns Free, Standard, VIP with price, total price, limits, AI chat flag and Benefits; `PUT /admin/tariffs/{type}` takes all seven fields every time, `null` meaning no limit; `PUT /admin/tariffs/{type}/benefits` takes the full ordered list.
- Tariff types map as `1` Free, `2` Standard, `3` VIP; meal types map as `1` Breakfast to `7` SecondBreakfast through an enum map.
- The Tariff form keeps a toggle per nullable limit; the form value converts to a draft that turns a switched-on toggle into `null`; `dietMealTypes` is `null` or a non-empty list.
- The Free Tariff's price is locked at zero; Standard and VIP require a price above zero; the total price is shown, never edited.
- Platform fee contract: `GET /admin/platform-fee` returns commission amount, tax percent, provider fee percent and currency; `PUT` takes the three numbers.
  The panel checks commission at least zero, both percents from 0 to 100, at most two decimals; no sample calculation until the backend documents the provider fee formula.
- The Trainer commission (model rule, dialog, row action, list column, sort field, store and service methods, DTO field, error key and translations) is removed.
- Tier Benefits contract: `GET /public/trainer-tier-benefits` returns both Tiers with Benefits; `PUT /admin/trainer-tier-benefits/{tier}` takes the full ordered list.
- Trainer subscriptions: the response carries `tier`; `PUT /admin/trainer-subscriptions/{id}/tier` changes it without touching dates; the action shows only on active subscriptions and asks for confirmation; the grant dialog stays Standard-only with a hint.
- Coach Clients: the summary carries `tier`; a Client can be messaged only when the subscription is not ended and the Tier is VIP.
- Coach chat: the read-only text says chat is open only to active VIP subscribers; `403 Chat.SubscriptionRequired` on open shows the read-only state without history, and on send switches to read-only, keeps the draft and shows a toast.
- New backend codes get user-facing texts in all three languages: `Tariff.FreeMustStayFree`, `Tariff.PaidPriceRequired`, `Tariff.NotFound`, `TrainerSubscription.NotFound`, `TrainerSubscription.NotActive`, `Chat.SubscriptionRequired`; `Trainer.InvalidCommissionPercent` goes away.
- Coach panel texts for VIP come from the Flutter app's ARB files; new admin texts use "o'quvchi" in Uzbek.
- The panel does not compare the VIP price with the Standard price; the backend owns that rule.
- Module docs for `trainers`, the coach module and the two new features are updated with the endpoints, rules and traps.

## Testing Decisions

- A good test checks behaviour a caller can see: what a store exposes after an action, what request a service sends, what a component renders and emits; never private methods or internal signals.
- Service seam: each new or changed service is tested with `ApiClient` mocked, asserting the HTTP method, path and full request body, and the mapped result.
  This is where the "always send" traps are proven: `vipMonthlyPrice: null` in both Trainer updates, all seven Tariff fields with `null` limits, the Tier body, the ordered Benefits list.
  Prior art: the coach device tokens and tus upload service specs.
- Mapper seam: DTO to model and draft to request conversions, including enum mapping for Tariff type, meal type and Tier, and `null` handling.
  Prior art: the trainer, trainer subscription and coach profile mapper specs.
- Store seam: each screen store with its feature service mocked: load, save, refresh after save, success and error toasts, Tier change on a subscription, Platform fee save, Tariff and Benefits saves, Coach profile saves keeping the VIP price, conversation store read-only handling of `Chat.SubscriptionRequired` on open and on send.
  Prior art: the trainers and trainer subscriptions store specs and the coach chat store specs.
- Model rules: Tariff form value to draft with toggles, Benefit validation limits, Client "can message" rule, price labels.
  Prior art: the trainer draft and coach client specs.
- Component seam: the shared Benefits dialog (given Benefits render as rows; add, remove and move change the emitted order; invalid rows block save) and the Tariff form toggles.
  Prior art: the form dialog and garment filters specs.
- Manual E2E on stage before each merge with `stage-admin` and `stage-coach`, covering backend scenarios 1 to 8; scenario 5 is covered by the locked Free price plus the error text mapping.
- `lint`, `test`, `test:coach`, `test:landing`, `build`, `build:coach` and `build:landing` pass for every PR.

## Out of Scope

- The landing VIP block on the public Trainer page.
- Granting a Tariff to a Soldier by hand and listing a Tariff's subscribers: the backend has no endpoints.
- A Tier filter in the subscriptions table: the backend has no query parameter.
- Choosing the Tier in the grant dialog.
- A sample Platform fee calculation.
- A payment orders screen and the earnings API changes.
- The new `PUT /admin/users/{id}/password` endpoint.
- Deploying anything to the production panels.

## Further Notes

- The release date is not set yet; everything waits for it.
- `stage-admin` and `stage-coach` passwords come from the backend through the user and are never written to the repo or memory.
- `admin-ui-platform-fee-v1.1.md` is missing; the user asks the backend how the provider fee is applied.
- After the last PR, a "ready on stage" message is drafted for the user to send to the backend.
