# 05: Admin: Platform fee sahifasi

**What to build:**
Admin yangi "Narxlar" menyu guruhidagi "Platform fee" sahifasida komissiya summasi, soliq foizi va to'lov provayderi foizini ko'radi va o'zgartiradi.
Valyuta summa yonida ko'rinadi.
O'zgarish faqat keyingi to'lovlarga ta'sir qilishi aytiladi va saqlashdan oldin tasdiq so'raladi.

**Blocked by:** 01

**Status:** resolved

- [x] Menyuda "Narxlar" guruhi va "Platform fee" bandi, sahifa o'z route'ida.
- [x] Komissiya 0 dan katta yoki teng, ikkala foiz 0 dan 100 gacha, ko'pi bilan 2 kasr; boshqasi formada rad etiladi.
- [x] Saqlashdan oldin tasdiq, keyin muvaffaqiyat toast'i va qayta yuklangan qiymatlar.
- [x] Yuklash xatosida qayta urinish, saqlash xatosida tushunarli matn.
- [x] Service, mapper va store testlari.
- [x] Yangi feature hujjati.
- [x] `lint`, `test`, `test:coach`, `test:landing`, `build`, `build:coach` va `build:landing` o'tadi.
- [ ] Stage'da qo'lda E2E o'tdi, PR `main`ga merge qilindi, prod'ga hech narsa chiqmadi.

## Answer

Yangi `platform-fee` feature: `/platform-fee` sahifasi "Narxlar" guruhida, `GET/PUT /admin/platform-fee`, valyuta (`currencyCode`) komissiya maydonining yonida, foizlar `%` bilan.
Forma Signal Forms bilan (`[formRoot]`), qiymatlar `linkedSignal` orqali qayta yuklangan ma'lumotdan to'ldiriladi; saqlashdan oldin `ConfirmDialogService`, keyin toast va qayta yuklash (PUT bo'sh `Result` qaytaradi).
Mahalliy soxta backend bilan brauzerda tekshirildi (yuklash, saqlash, rad etish, yuklash xatosi va qayta urinish); stage'da qo'lda E2E qolgan. Commit: `9a9c7b0`.
