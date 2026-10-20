# 02 - Prod proxy va kontrakt manbai

**What to build:** Dasturchi `npm run start:prod` (admin) yoki `npm run start:coach:prod` (coach) bilan panelni lokal ishga tushiradi va u `api.peaktofan.com` dagi `v9.1` API bilan ishlaydi.
Hujjatlar yangi Swagger'ni kontrakt manbai deb ko'rsatadi va bu server relizdan keyin prod bo'lishini ogohlantiradi.

**Blocked by:** None - can start immediately

**Status:** ready-for-agent

- [ ] `proxy.prod.conf.json`: `/api` dan `https://api.peaktofan.com` ga, prefiks olib tashlanadi, `secure`, `changeOrigin`, `ws: true`
- [ ] `start:prod` va `start:coach:prod` skriptlari, Nx orqali, mavjud `start:staging` uslubida
- [ ] `start:staging` o'zgarmagan
- [ ] CLAUDE.md va AGENTS.md: kontrakt manbai `https://api.peaktofan.com/swagger/v1/swagger.json`, yangi buyruqlar, «relizdan keyin prod, sinov ma'lumoti yaratmang» ogohlantirishi
- [ ] `lint:comments` JSON faylni qabul qiladi
- [ ] `npm run start:prod` bilan login sahifasi ochiladi va `/api` so'rovlari yangi serverga boradi
