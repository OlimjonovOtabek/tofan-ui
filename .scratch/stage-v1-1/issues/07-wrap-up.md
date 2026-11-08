# 07: Yakun - hisobot, tiklashni tekshirish, merge va PR

**What to build:** sinov yakunida stage boshlang'ich holatda bo'ladi, hisobot backend'ga yuborishga tayyor, va sinovda topilgan frontend tuzatishlari release'ga kiradi.

**Blocked by:** 02, 03, 04, 05, 06.

**Status:** resolved

- [x] Hamma o'zgartirilgan qiymatlar (Tariff narxlari, Benefit ro'yxatlari, Coach narxlari) oxirgi marta read-back qilingan va hisobotdagi boshlang'ich qiymatlar bilan bir xil.
- [x] Hisobotda har band uchun qadamlar, kutilgan va haqiqiy natija, xatolar kod va `title` bilan, o'zgarish va tiklash vaqtlari bor; backend uchun ochiq qolgan savollar alohida ro'yxatda.
- [x] Sinovda tuzatilgan har frontend xatosining testi bor va o'z commit'ida.
- [x] `lint`, `test`, `test:coach`, `test:landing`, `build`, `build:coach`, `build:landing` o'tgan.
- [x] Branch `main` ga `--no-ff` bilan merge qilingan, `origin` ga push qilingan va upstream'ga PR ochilgan; commit va PR'da co-author yoki "Generated with" qatori yo'q.
- [x] Hisobotdagi o'zgargan fayllar daraxti va PR havolasi foydalanuvchiga berilgan.

## Comments

Merge `--no-ff` `main` ga, push `origin/main` ga. Upstream'da `main` head'li PR #25 hali ochiq edi, shuning uchun yangi PR ochilmadi, commit'lar #25 ga qo'shildi va uning tavsifiga bo'lim qo'shildi.
Hisobot: `test-report.md`. Backend javobi: `backend-reply.md`.
