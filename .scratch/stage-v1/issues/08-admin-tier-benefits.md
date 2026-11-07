# 08: Admin: Tier Benefit'lari tabi va umumiy Benefits muharriri

**What to build:**
Admin Trenerlar sahifasidagi "Darajalar" tabida Standard va VIP kartalarini va ularning Benefit'larini ko'radi.
"Imtiyozlar" tugmasi umumiy Benefits dialogini ochadi: har qatorda EN, RU, UZ matn, qo'shish, o'chirish, drag va yuqoriga/pastga tugmalari.
Plain-text ogohlantirishi dialogda turadi.
Saqlangan tartib ko'rilgan tartibga teng.

**Blocked by:** 06

**Status:** ready-for-agent

- [ ] Uchinchi tab "Darajalar", ikkita karta, Benefit'lar admin tilida.
- [ ] Umumiy Benefit modeli va dialog umumiy kutubxonada, 20 tagacha qator, har matn majburiy va 200 belgigacha.
- [ ] Drag va klaviatura bilan tartiblash, saqlashda butun ro'yxat yuboriladi.
- [ ] Dialog komponent testi: berilgan Benefit'lar ko'rinadi, qo'shish, o'chirish va surish chiqadigan tartibni o'zgartiradi, xato qator saqlashni to'sadi.
- [ ] Service testi: to'g'ri yo'l va tartiblangan tana; store testi.
- [ ] Stage'da Benefit qo'shildi, surildi, o'chirildi, tartib saqlandi.
- [ ] Trainers moduli hujjati yangilangan.
- [ ] `lint`, `test`, `test:coach`, `test:landing`, `build`, `build:coach` va `build:landing` o'tadi.
- [ ] Stage'da qo'lda E2E o'tdi, PR `main`ga merge qilindi, prod'ga hech narsa chiqmadi.
