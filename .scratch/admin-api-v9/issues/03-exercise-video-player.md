# 03 - Mashq tahrirlash oynasida video pleyer

**What to build:** Admin mashqni tahrirlash uchun ochganda, saqlangan video backend bergan imzoli `videoUrl` orqali pleyerda o'ynaydi.
Admin video'ni almashtirishdan oldin hozirgisini ko'radi.
Yangi video yuklansa, uning imzoli havolasi hali yo'q, shuning uchun pleyer yashiriladi.
Video havolasi hech qachon `videoFileId` dan yasalmaydi.

**Blocked by:** 02 - Prod proxy va kontrakt manbai (E2E uchun `v9.1` API)

**Status:** ready-for-agent

- [ ] Mashq DTO'sida `videoUrl: string | null`, model va mapper'da API asosi bilan to'liq URL
- [ ] Tahrirlash oynasida saqlangan video uchun `<video controls>`; videosiz mashqda pleyer yo'q
- [ ] Yangi video yuklanganda yoki video olib tashlanganda pleyer yashiriladi
- [ ] Pleyer xato bersa tushunarli holat ko'rinadi (i18n uz/ru/en)
- [ ] Mapper testi (`videoUrl` bor va `null`) va komponent testi (pleyer ko'rinadi / yashirin)
- [ ] `docs/modules/exercises.md` yangilangan
- [ ] E2E: `start:prod` da video'li mashq ochiladi va video o'ynaydi
