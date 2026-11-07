# 03: Admin: Trainer VIP price

**What to build:**
Admin Trenerlar ro'yxatida har Trainer'ning VIP price'ini ko'radi va tahrir formasida uni o'rnatadi, o'zgartiradi yoki bo'shatadi.
Boshqa maydon saqlanganda VIP price saqlanib qoladi, chunki u har so'rovda yuboriladi.
Bo'sh maydon "faqat Standard" degani.

**Blocked by:** 02

**Status:** resolved

- [x] Ro'yxatda "VIP narxi" ustuni, VIP price'siz Trainer'da bo'sh katak.
- [x] Tahrir formasida ixtiyoriy VIP narxi maydoni joriy qiymat bilan to'ldirilgan, "bo'sh = faqat Standard" izohi bor.
- [x] 0 yoki manfiy VIP narxi formada rad etiladi.
- [x] Service testi: yangilash so'rovi tanasida `vipMonthlyPrice` har doim bor, bo'sh bo'lsa `null`.
- [x] Mapper va draft testlari VIP price'ni o'tkazadi.
- [ ] Backend 1, 2, 3 ssenariylari stage'da o'tdi.
- [x] Trainers moduli hujjati yangilangan.
- [x] `lint`, `test`, `test:coach`, `test:landing`, `build`, `build:coach` va `build:landing` o'tadi.
- [ ] Stage'da qo'lda E2E o'tdi, PR `main`ga merge qilindi, prod'ga hech narsa chiqmadi.

## Answer

The Trainers list has a read-only "VIP narxi" column (empty `-` cell when the Trainer sells Standard only) and the edit dialog an optional VIP narxi field, prefilled with the current value, with the "bo'sh = faqat Standard" hint; 0 or below is refused by the form.
`vipMonthlyPrice` is a required key of `UpdateTrainerRequest` and a field of `TrainerEditDraft`, so every save sends it as a number or `null`; the new `trainers.service.spec.ts` proves the key on the wire, and mapper, draft, schema, store, list page and dialog specs prove pass-through on other edits, clearing and refusal.
The edit form was already Signal Forms, so the new field follows it; scenarios 1 to 3 on stage and the manual E2E are left for whoever has the stage passwords. Commit fc79334 on `feat/stage-v1-03-admin-trainer-vip-price`.
