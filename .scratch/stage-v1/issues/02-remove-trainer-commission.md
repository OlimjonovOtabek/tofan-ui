# 02: Trainer komissiyasini olib tashlash

**What to build:**
Admin Trenerlar ro'yxatida endi komissiya foizi ustuni, saralash, tugma va dialog yo'q.
Backend bu endpoint'ni olib tashlagan va u 404 beradi, uning o'rnini Platform fee egallaydi.
Bu prefactor: Trenerlar ro'yxati sahifasida keyingi VIP ustuni uchun joy bo'shaydi.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Ro'yxatda komissiya ustuni va uning saralashi yo'q.
- [ ] Qator amallarida komissiya tugmasi yo'q, dialog va unga tegishli model qoidasi o'chirilgan.
- [ ] Store, service, DTO va mapper'da komissiya qolmagan, eskirgan xato kodi va tarjimalar o'chirilgan.
- [ ] Trainers moduli hujjatida komissiya o'rniga Platform fee'ga havola.
- [ ] Mavjud trainers testlari yashil.
- [ ] `lint`, `test`, `test:coach`, `test:landing`, `build`, `build:coach` va `build:landing` o'tadi.
- [ ] Stage'da qo'lda E2E o'tdi, PR `main`ga merge qilindi, prod'ga hech narsa chiqmadi.
