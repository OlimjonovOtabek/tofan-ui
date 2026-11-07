# 13: Stage'da yakuniy sinov va backend'ga xabar

**What to build:**
Backend hujjatining 1-8 sinov ssenariylari `main` stage'ga qo'yilgandan keyin `admin.stage` va `coach.stage` da birga o'tkaziladi.
8-ssenariy admin va coach panel birga: Sub User Standard bo'lganda coach'da yozish yopiladi va tarix ko'rinadi, VIP bo'lganda ochiladi.
Oxirida backend uchun "stage'da tayyor" xabari yoziladi, uni foydalanuvchi yuboradi.

**Blocked by:** 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12

**Status:** ready-for-agent

- [ ] 1-8 ssenariylar stage panellarida o'tdi, 5-ssenariy Free qulfi va xato matni bilan.
- [ ] Topilgan nuqsonlar tuzatilgan yoki alohida ticket qilingan.
- [ ] Backend uchun xabar matni foydalanuvchiga berilgan.
- [ ] Hech narsa prod panellariga chiqmagan.

## Comments

2026-11-07: stage E2E ran against the dev servers (`start:staging`, `start:coach:staging`) with `stage-admin` and `stage-coach`; nothing was deployed to the stage panels or to production.

Verified on stage:
- Admin Platform fee: load, cancel of the confirm sends nothing, save of unchanged values sends `PUT` 200 and reloads.
- Admin Tariffs: Free, Standard and VIP cards; Free price locked at zero; `PUT /admin/tariffs/1` carries all seven fields with `null` limits; Standard scan limit switched to Cheksiz (`null`) and restored to 15.
- Tariff and Tier Benefits: drag, up and down buttons, save and restore of the order; the dialog keeps the order it shows.
- Admin Trainers: VIP column, edit dialog prefilled, save keeps `vipMonthlyPrice`, clearing sends `null` and the column shows `-`, restored to 400 000.
- Subscriptions: Tier column, Standard and VIP switch with confirm, dates untouched, grant dialog hint.
- Coach: VIP tag in the Clients list and on the Client page, the write button only for VIP, chat open for VIP, a send refused with 403 `Chat.SubscriptionRequired` turns the conversation read-only with a toast and no redirect, history stays readable, VIP again reopens the composer.
- Coach profile shows `200 000 UZS / oy · VIP 400 000`; the pricing page save sends `vipMonthlyPrice: 400000`.

Defects found and fixed (branch `feat/stage-v1-e2e-fixes`): focus lost after moving a Benefit with the keyboard, blocked save of an invalid row below the fold gave no visible feedback, the unsent chat draft was invisible, the trainer Bio textarea was half width.

Open, for the backend: `GET /tariffs` returns `totalPrice` equal to `monthlyPrice` (120000 and 300000) although the Platform fee is 50000 UZS plus 2 percent; the chat shows the name "Sub" while the Clients list shows "Sub User".

Not verified: editing Standard or VIP with a price change, `Tariff.PaidPriceRequired` error text, adding and deleting a Benefit on stage, Coach VIP price change from the pricing page, scenario list numbering against the backend hand-off (the original list was not available in this session).
