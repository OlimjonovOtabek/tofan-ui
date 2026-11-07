# 02: Trainer komissiyasini olib tashlash

**What to build:**
Admin Trenerlar ro'yxatida endi komissiya foizi ustuni, saralash, tugma va dialog yo'q.
Backend bu endpoint'ni olib tashlagan va u 404 beradi, uning o'rnini Platform fee egallaydi.
Bu prefactor: Trenerlar ro'yxati sahifasida keyingi VIP ustuni uchun joy bo'shaydi.

**Blocked by:** 01

**Status:** resolved

- [x] Ro'yxatda komissiya ustuni va uning saralashi yo'q.
- [x] Qator amallarida komissiya tugmasi yo'q, dialog va unga tegishli model qoidasi o'chirilgan.
- [x] Store, service, DTO va mapper'da komissiya qolmagan, eskirgan xato kodi va tarjimalar o'chirilgan.
- [x] Trainers moduli hujjatida komissiya o'rniga Platform fee'ga havola.
- [x] Mavjud trainers testlari yashil.
- [x] `lint`, `test`, `test:coach`, `test:landing`, `build`, `build:coach` va `build:landing` o'tadi.
- [ ] Stage'da qo'lda E2E o'tdi, PR `main`ga merge qilindi, prod'ga hech narsa chiqmadi.

## Answer

Trainer commission is gone from the admin Trainers feature: the list column and sort, the row action and dialog, the model rule, the DTO field, the store and service methods, `Trainer.InvalidCommissionPercent` and the uz, ru and en translations.
`TrainersListPage` dropped from 200 to 167 lines, and `docs/modules/trainers.md` now points to the Platform fee page (global, not per Trainer); the Platform fee module doc link is added by ticket 05.
New specs cover the row actions, the list page columns and the retired error code. Commit e1a6708 on `feat/stage-v1-02-remove-trainer-commission`.
