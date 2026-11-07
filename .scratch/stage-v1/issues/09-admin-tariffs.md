# 09: Admin: Tofan Tariff'lari sahifasi va tahrir formasi

**What to build:**
Admin "Narxlar" guruhidagi "Tofan tariflari" sahifasida Free, Standard va VIP kartalarini ko'radi: narx, umumiy narx, limitlar so'z bilan, AI chat bor-yo'qligi va Benefit'lar.
"Tahrirlash" formasi narx va limitlarni o'zgartiradi, har nullable limit yonida "Cheksiz", "Hammasi ochiq" yoki "Almashmaydi" toggle'i turadi.
Free narxi 0 da qulflangan.
Hamma maydon har doim yuboriladi.

**Blocked by:** 01

**Status:** resolved

- [x] Kartalar Free, Standard, VIP tartibida, telefonda ustma-ust.
- [x] Toggle yoqilsa raqam maydoni o'chadi va `null` yuboriladi; ovqat turlari toggle o'chsa kamida bittasi tanlanadi.
- [x] Free narxi qulf, Standard va VIP narxi 0 dan katta; `Tariff.*` kodlari tushunarli matn bilan.
- [x] Umumiy narx faqat ko'rsatiladi, saqlashdan keyin ro'yxat qayta yuklanadi.
- [x] Service testi: yettala maydon tanada, `null` limitlar bilan; mapper, forma qiymati va store testlari.
- [x] Stage'da Standard'ning scan limiti "Cheksiz" qilindi, `GET /tariffs` da `null`, keyin qaytarildi.
- [x] Menyu guruhi 05 bilan bir xil, qaysi biri oldin merge bo'lsa o'sha yaratadi.
- [x] Yangi feature hujjati.
- [x] `lint`, `test`, `test:coach`, `test:landing`, `build`, `build:coach` va `build:landing` o'tadi.
- [ ] Stage'da qo'lda E2E o'tdi, PR `main`ga merge qilindi, prod'ga hech narsa chiqmadi.

## Answer

New admin feature `tariffs` (`/tariffs`, menu group "Narxlar" > "Tofan tariflari"): Free, Standard and VIP cards sorted by type with price, total price, limits in words, AI chat and read-only Benefits, plus a Signal Forms edit dialog with a toggle per nullable limit, a locked Free price and all seven fields on every PUT.
A shared `app-multiselect-field` wrapper serves the meal types, and the `Tariff.*` backend codes have texts in uz, ru and en.
The two stage-only boxes (scan limit round trip and manual E2E, merge) stay open because nobody here has stage passwords.

Commit: 5d59038 (branch feat/stage-v1-09-admin-tariffs).
