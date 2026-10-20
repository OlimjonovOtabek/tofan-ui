# 05 - Trenerlar ro'yxatida slug ustuni

**What to build:** Admin trenerlar ro'yxatida har trenerning `slug` ini «Havola» ustunida oddiy matn sifatida ko'radi.
Masalan, Kirill ismli trenerlarga migratsiya bergan `trainer` yoki `trainer-2` kabi qiymatlar ham ko'rinadi.
Ustun bosiladigan havola emas, nusxalash tugmasi yo'q va admin `slug` ni o'zgartira olmaydi: uni trener o'zi o'zgartiradi, `peaktofan.com/t/<slug>` ni esa faqat mobil ilova ochadi.

**Blocked by:** 01 - Komissiya ishini yakunlash (o'sha fayllar), 02 - Prod proxy va kontrakt manbai (E2E)

**Status:** ready-for-agent

- [ ] Trener DTO, model va mapper'da `slug`
- [ ] Ro'yxatda «Havola» ustuni, i18n kaliti uz/ru/en da
- [ ] Mapper testi `slug` ni o'tkazadi
- [ ] `docs/modules/trainers.md` yangilangan
- [ ] E2E: `start:prod` da ro'yxatda haqiqiy slug'lar ko'rinadi, jadval kengligi buzilmagan
