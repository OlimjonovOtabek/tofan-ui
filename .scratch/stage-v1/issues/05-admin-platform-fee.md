# 05: Admin: Platform fee sahifasi

**What to build:**
Admin yangi "Narxlar" menyu guruhidagi "Platform fee" sahifasida komissiya summasi, soliq foizi va to'lov provayderi foizini ko'radi va o'zgartiradi.
Valyuta summa yonida ko'rinadi.
O'zgarish faqat keyingi to'lovlarga ta'sir qilishi aytiladi va saqlashdan oldin tasdiq so'raladi.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Menyuda "Narxlar" guruhi va "Platform fee" bandi, sahifa o'z route'ida.
- [ ] Komissiya 0 dan katta yoki teng, ikkala foiz 0 dan 100 gacha, ko'pi bilan 2 kasr; boshqasi formada rad etiladi.
- [ ] Saqlashdan oldin tasdiq, keyin muvaffaqiyat toast'i va qayta yuklangan qiymatlar.
- [ ] Yuklash xatosida qayta urinish, saqlash xatosida tushunarli matn.
- [ ] Service, mapper va store testlari.
- [ ] Yangi feature hujjati.
- [ ] `lint`, `test`, `test:coach`, `test:landing`, `build`, `build:coach` va `build:landing` o'tadi.
- [ ] Stage'da qo'lda E2E o'tdi, PR `main`ga merge qilindi, prod'ga hech narsa chiqmadi.
