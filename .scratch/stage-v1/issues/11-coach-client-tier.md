# 11: Coach panel: Client Tier va "Xabar yozish"

**What to build:**
Trainer Client'lar ro'yxatida va Client sahifasida VIP Client yonida VIP tag'ni ko'radi.
"Xabar yozish" tugmasi faqat obunasi tugamagan va VIP Client'da chiqadi.
Matnlar Flutter ilovasidan olinadi.

**Blocked by:** 06

**Status:** resolved

- [x] Ro'yxat qatorida va Client sahifasida VIP tag.
- [x] "Xabar yozish" faqat faol VIP Client'da.
- [x] Mapper testi: `tier` o'qiladi; "xabar yozsa bo'ladimi" qoidasi testlangan.
- [ ] Stage'da Sub User VIP holatida tugma bor, Standard'da yo'q.
- [x] Coach moduli hujjati yangilangan.
- [x] `lint`, `test`, `test:coach`, `test:landing`, `build`, `build:coach` va `build:landing` o'tadi.
- [ ] Stage'da qo'lda E2E o'tdi, PR `main`ga merge qilindi, prod'ga hech narsa chiqmadi.

## Answer

Coach `Client` now carries `tier` (`tiers.toDomainOrNull(x) ?? 'standard'`, so a prod build without `tier` does not throw) and the pure rules `isVip` and `canMessage` (subscription not ended and VIP) in `core/clients/client.ts`.
The Clients list row and the Client page show a VIP tag (`coachApp.clients.tierVip`), and the write button with its sticky footer shows only when `canMessage` holds; the page takes the Tier from the list summary because the single-client endpoint has none.
Specs cover the mapper, the rule matrix, the detail store and both pages' rendering; the Stage check with Sub User stays manual.
Commit `261d773`.
