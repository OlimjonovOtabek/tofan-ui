# 01: Stage proxy va hujjatlar

**What to build:**
Dasturchi `start:staging` va `start:coach:staging` ni ishga tushirganda panel stage API'ga ulanadi.
Coach panelda chat hub stage orqali ishlaydi.
Loyiha hujjatlarida yopilgan eski server o'rniga stage manzili turadi, relizga chiqmagan ishlar uchun kontrakt manbai stage Swagger.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] Staging proxy stage API'ga qaraydi va WebSocket'ni uzatadi.
- [x] Admin stage'da login sahifasigacha ochiladi, coach panel ham.
- [x] Loyiha qoidalari, agentlar uchun qoidalar va README'da eski server qolmagan.
- [x] `CONTEXT.md` va spec shu PR bilan qo'shilgan.
- [x] `lint`, `test`, `test:coach`, `test:landing`, `build`, `build:coach` va `build:landing` o'tadi.
- [ ] Stage'da qo'lda E2E o'tdi, PR `main`ga merge qilindi, prod'ga hech narsa chiqmadi.

## Answer

`proxy.staging.conf.json` stage API'ga (`https://api.stage.peaktofan.com`) qaraydi va `ws: true` bilan WebSocket'ni uzatadi.
`CLAUDE.md`, `AGENTS.md` va `README.md` da eski server faqat "yopilgan" ogohlantirishi sifatida qoldi.
`CONTEXT.md` va spec bilan birga commit `1baef33`.
`start:staging` (4200) va `start:coach:staging` (4300) `feat/stage-v1` tip'ida ishga tushirildi: ikkala login sahifasi ochiladi, konsol toza.
Proxy orqali `GET /api/public/trainer-tier-benefits` 200 (Standard 2, VIP 3 ta Benefit) qaytardi, tokensiz `/api/tariffs`, `/api/admin/platform-fee`, `/api/coach/profile` va `/api/hubs/chat/negotiate` 401 berdi, ya'ni so'rovlar stage'ga yetib boryapti.
Login bilan E2E va `main`ga merge qolgan, chunki stage paroli va foydalanuvchi ruxsati kerak.
