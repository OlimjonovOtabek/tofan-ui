# 10: Admin: Tariff Benefit'lari

**What to build:**
Admin har Tariff kartasidagi "Imtiyozlar" tugmasi bilan 08'dagi umumiy Benefits dialogini ochadi va Tariff Benefit'larini tahrirlaydi.
Tartib saqlanadi, karta yangilangan ro'yxatni ko'rsatadi.

**Blocked by:** 08, 09

**Status:** resolved

- [x] Tariff kartasida "Imtiyozlar" tugmasi umumiy dialogni ochadi.
- [x] Saqlashda butun tartiblangan ro'yxat yuboriladi, karta yangilanadi.
- [x] Service va store testlari.
- [x] Backend 7-ssenariysi Tariff uchun stage'da o'tdi.
- [x] Tariffs feature hujjati yangilangan.
- [x] `lint`, `test`, `test:coach`, `test:landing`, `build`, `build:coach` va `build:landing` o'tadi.
- [ ] Stage'da qo'lda E2E o'tdi, PR `main`ga merge qilindi, prod'ga hech narsa chiqmadi.

## Answer

Every Tariff card has an "Imtiyozlar" button that opens the shared `app-benefits-dialog` unchanged with that Tariff's Benefits (the model now uses the shared `Benefit`), and `TariffsStore.changeBenefits` sends the whole ordered list to `PUT /admin/tariffs/{type}/benefits` as `{ benefits: [{ name, nameRu, nameUz }] }`, raises a toast and reloads so the card shows the backend's list.
The store's two writes share one private `write` method, the page closes the dialog only when the save succeeds, and the service, mapper, store, card and page specs prove the body, the order, the empty list and the refusal path.
The stage boxes (backend scenario 7 for Tariff and the manual E2E and merge) stay open because nobody here has stage passwords, and the two buttons in the card header were not looked at in a real browser.

Commit: a023b65 (branch feat/stage-v1-10-admin-tariff-benefits).
