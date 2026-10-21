# 07 - Yakuniy tekshiruv va merge

**What to build:** Barcha ishlar bitta yashil branch'da tekshiriladi va `main` ga tushadi, shunda admin panelning yangi image'ini `v9.1` server uchun yig'ish mumkin bo'ladi.

**Blocked by:** 01, 02, 03, 04, 05, 06

**Status:** ready-for-agent

- [ ] `npm run lint`, `npm test`, `npm run test:coach`, `npm run build`, `npm run build:coach` yashil
- [ ] `architecture-reviewer` tekshiruvi, topilganlar tuzatilgan
- [ ] E2E (`start:prod`, foydalanuvchi o'zi login qiladi): mashq pleyeri, media'da imzoli video, `slug` ustuni, komissiya dialogi
- [ ] `graphify update .` bajarilgan
- [ ] `main` ga lokal `--no-ff` merge («Merge admin-api-v9: ...»), push yo'q
- [ ] Stash'dagi «trainer-commission wip» zaxirasi o'chirilgan
