# 03: Admin: Trainer VIP price

**What to build:**
Admin Trenerlar ro'yxatida har Trainer'ning VIP price'ini ko'radi va tahrir formasida uni o'rnatadi, o'zgartiradi yoki bo'shatadi.
Boshqa maydon saqlanganda VIP price saqlanib qoladi, chunki u har so'rovda yuboriladi.
Bo'sh maydon "faqat Standard" degani.

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] Ro'yxatda "VIP narxi" ustuni, VIP price'siz Trainer'da bo'sh katak.
- [ ] Tahrir formasida ixtiyoriy VIP narxi maydoni joriy qiymat bilan to'ldirilgan, "bo'sh = faqat Standard" izohi bor.
- [ ] 0 yoki manfiy VIP narxi formada rad etiladi.
- [ ] Service testi: yangilash so'rovi tanasida `vipMonthlyPrice` har doim bor, bo'sh bo'lsa `null`.
- [ ] Mapper va draft testlari VIP price'ni o'tkazadi.
- [ ] Backend 1, 2, 3 ssenariylari stage'da o'tdi.
- [ ] Trainers moduli hujjati yangilangan.
- [ ] `lint`, `test`, `test:coach`, `test:landing`, `build`, `build:coach` va `build:landing` o'tadi.
- [ ] Stage'da qo'lda E2E o'tdi, PR `main`ga merge qilindi, prod'ga hech narsa chiqmadi.
