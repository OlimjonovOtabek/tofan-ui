# 06: Tier umumiy modeli

**What to build:**
Tier (Standard, VIP) va uning backend sonlari (`1`, `2`) bir joyda, umumiy kutubxonada aniqlanadi.
Admin obunalari, Tier Benefit'lari va coach Client'lari shuni ishlatadi, feature'lar bir-birini import qilmaydi.
Bu prefactor, foydalanuvchiga ko'rinadigan o'zgarish yo'q.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Tier domen qiymati va DTO enum umumiy kutubxonada, enum map orqali bog'langan.
- [ ] Ikki yo'nalishdagi mapping va noma'lum qiymat testlari.
- [ ] Chegaralar tekshiruvi (Sheriff) yashil.
- [ ] `lint`, `test`, `test:coach`, `test:landing`, `build`, `build:coach` va `build:landing` o'tadi.
- [ ] Stage'da qo'lda E2E o'tdi, PR `main`ga merge qilindi, prod'ga hech narsa chiqmadi.
