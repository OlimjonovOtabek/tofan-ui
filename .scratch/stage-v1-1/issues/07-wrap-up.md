# 07: Yakun - hisobot, tiklashni tekshirish, merge va PR

**What to build:** sinov yakunida stage boshlang'ich holatda bo'ladi, hisobot backend'ga yuborishga tayyor, va sinovda topilgan frontend tuzatishlari release'ga kiradi.

**Blocked by:** 02, 03, 04, 05, 06.

**Status:** ready-for-agent

- [ ] Hamma o'zgartirilgan qiymatlar (Tariff narxlari, Benefit ro'yxatlari, Coach narxlari) oxirgi marta read-back qilingan va hisobotdagi boshlang'ich qiymatlar bilan bir xil.
- [ ] Hisobotda har band uchun qadamlar, kutilgan va haqiqiy natija, xatolar kod va `title` bilan, o'zgarish va tiklash vaqtlari bor; backend uchun ochiq qolgan savollar alohida ro'yxatda.
- [ ] Sinovda tuzatilgan har frontend xatosining testi bor va o'z commit'ida.
- [ ] `lint`, `test`, `test:coach`, `test:landing`, `build`, `build:coach`, `build:landing` o'tgan.
- [ ] Branch `main` ga `--no-ff` bilan merge qilingan, `origin` ga push qilingan va upstream'ga PR ochilgan; commit va PR'da co-author yoki "Generated with" qatori yo'q.
- [ ] Hisobotdagi o'zgargan fayllar daraxti va PR havolasi foydalanuvchiga berilgan.
