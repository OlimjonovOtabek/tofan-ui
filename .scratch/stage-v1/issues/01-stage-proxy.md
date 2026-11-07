# 01: Stage proxy va hujjatlar

**What to build:**
Dasturchi `start:staging` va `start:coach:staging` ni ishga tushirganda panel stage API'ga ulanadi.
Coach panelda chat hub stage orqali ishlaydi.
Loyiha hujjatlarida yopilgan eski server o'rniga stage manzili turadi, relizga chiqmagan ishlar uchun kontrakt manbai stage Swagger.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Staging proxy stage API'ga qaraydi va WebSocket'ni uzatadi.
- [ ] Admin stage'da login sahifasigacha ochiladi, coach panel ham.
- [ ] Loyiha qoidalari, agentlar uchun qoidalar va README'da eski server qolmagan.
- [ ] `CONTEXT.md` va spec shu PR bilan qo'shilgan.
- [ ] `lint`, `test`, `test:coach`, `test:landing`, `build`, `build:coach` va `build:landing` o'tadi.
- [ ] Stage'da qo'lda E2E o'tdi, PR `main`ga merge qilindi, prod'ga hech narsa chiqmadi.
