# 09: Admin: Tofan Tariff'lari sahifasi va tahrir formasi

**What to build:**
Admin "Narxlar" guruhidagi "Tofan tariflari" sahifasida Free, Standard va VIP kartalarini ko'radi: narx, umumiy narx, limitlar so'z bilan, AI chat bor-yo'qligi va Benefit'lar.
"Tahrirlash" formasi narx va limitlarni o'zgartiradi, har nullable limit yonida "Cheksiz", "Hammasi ochiq" yoki "Almashmaydi" toggle'i turadi.
Free narxi 0 da qulflangan.
Hamma maydon har doim yuboriladi.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Kartalar Free, Standard, VIP tartibida, telefonda ustma-ust.
- [ ] Toggle yoqilsa raqam maydoni o'chadi va `null` yuboriladi; ovqat turlari toggle o'chsa kamida bittasi tanlanadi.
- [ ] Free narxi qulf, Standard va VIP narxi 0 dan katta; `Tariff.*` kodlari tushunarli matn bilan.
- [ ] Umumiy narx faqat ko'rsatiladi, saqlashdan keyin ro'yxat qayta yuklanadi.
- [ ] Service testi: yettala maydon tanada, `null` limitlar bilan; mapper, forma qiymati va store testlari.
- [ ] Stage'da Standard'ning scan limiti "Cheksiz" qilindi, `GET /tariffs` da `null`, keyin qaytarildi.
- [ ] Menyu guruhi 05 bilan bir xil, qaysi biri oldin merge bo'lsa o'sha yaratadi.
- [ ] Yangi feature hujjati.
- [ ] `lint`, `test`, `test:coach`, `test:landing`, `build`, `build:coach` va `build:landing` o'tadi.
- [ ] Stage'da qo'lda E2E o'tdi, PR `main`ga merge qilindi, prod'ga hech narsa chiqmadi.
