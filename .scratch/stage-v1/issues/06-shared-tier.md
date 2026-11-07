# 06: Tier umumiy modeli

**What to build:**
Tier (Standard, VIP) va uning backend sonlari (`1`, `2`) bir joyda, umumiy kutubxonada aniqlanadi.
Admin obunalari, Tier Benefit'lari va coach Client'lari shuni ishlatadi, feature'lar bir-birini import qilmaydi.
Bu prefactor, foydalanuvchiga ko'rinadigan o'zgarish yo'q.

**Blocked by:** 01

**Status:** resolved

- [x] Tier domen qiymati va DTO enum umumiy kutubxonada, enum map orqali bog'langan.
- [x] Ikki yo'nalishdagi mapping va noma'lum qiymat testlari.
- [x] Chegaralar tekshiruvi (Sheriff) yashil.
- [x] `lint`, `test`, `test:coach`, `test:landing`, `build`, `build:coach` va `build:landing` o'tadi.
- [ ] Stage'da qo'lda E2E o'tdi, PR `main`ga merge qilindi, prod'ga hech narsa chiqmadi.

## Answer

The Tier lives in `libs/shared/src/models`: `tier.ts` (`Tier` union and `TIERS`), `tier.dto.ts` (`TierDto` with `Standard` 1 and `Vip` 2, plus the `tiers` enum map) and `tier-labels.ts` (`TIER_LABELS` pointing at the new `enums.tier.*` keys in uz, ru and en).
Specs cover both mapping directions, the strict and lenient readers on unknown values, and that every label resolves in all three languages.
Commit `eaeab56`.
