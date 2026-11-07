# 08: Admin: Tier Benefit'lari tabi va umumiy Benefits muharriri

**What to build:**
Admin Trenerlar sahifasidagi "Darajalar" tabida Standard va VIP kartalarini va ularning Benefit'larini ko'radi.
"Imtiyozlar" tugmasi umumiy Benefits dialogini ochadi: har qatorda EN, RU, UZ matn, qo'shish, o'chirish, drag va yuqoriga/pastga tugmalari.
Plain-text ogohlantirishi dialogda turadi.
Saqlangan tartib ko'rilgan tartibga teng.

**Blocked by:** 06

**Status:** resolved

- [x] Uchinchi tab "Darajalar", ikkita karta, Benefit'lar admin tilida.
- [x] Umumiy Benefit modeli va dialog umumiy kutubxonada, 20 tagacha qator, har matn majburiy va 200 belgigacha.
- [x] Drag va klaviatura bilan tartiblash, saqlashda butun ro'yxat yuboriladi.
- [x] Dialog komponent testi: berilgan Benefit'lar ko'rinadi, qo'shish, o'chirish va surish chiqadigan tartibni o'zgartiradi, xato qator saqlashni to'sadi.
- [x] Service testi: to'g'ri yo'l va tartiblangan tana; store testi.
- [ ] Stage'da Benefit qo'shildi, surildi, o'chirildi, tartib saqlandi.
- [x] Trainers moduli hujjati yangilangan.
- [x] `lint`, `test`, `test:coach`, `test:landing`, `build`, `build:coach` va `build:landing` o'tadi.
- [ ] Stage'da qo'lda E2E o'tdi, PR `main`ga merge qilindi, prod'ga hech narsa chiqmadi.

## Answer

The "Darajalar" tab (`/trainers/tiers`) in the `trainers` feature shows a card per Tier (Standard, VIP) with its Benefits in the admin language, and an "Imtiyozlar" button opens the new shared `app-benefits-dialog` (`libs/shared`): inputs are the current Benefits, a saving flag and the header, the output is the ordered list, and `TrainerTiersStore` does the PUT with the whole list and reloads.
The dialog has EN, RU and UZ inputs per row, CDK drag with a handle, up and down buttons, add up to 20, remove, 200 character limit with trimmed required texts, a plain text warning, and a client side row key because Benefits have no backend id; its contract is in `docs/modules/benefits-dialog.md`.
The two stage boxes (adding, moving and deleting a Benefit on stage, and the manual E2E and merge) stay open because nobody here has stage passwords, and the drag preview position inside the Optimus dialog still needs a look in a real browser.
