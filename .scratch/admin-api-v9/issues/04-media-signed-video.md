# 04 - Media sahifasida imzoli video havolasi

**What to build:** Media sahifasida mashqqa bog'langan video ko'rish va yuklab olish uchun `GET /exercises` javobidagi imzoli `videoUrl` bilan ochiladi, shuning uchun video himoyasi yoqilgach ham ishlaydi.
Hech qaysi mashqqa bog'lanmagan video hozircha eski `/files/{id}/content` havolasi bilan ochiladi.
Himoya yoqilgach u ochilmasa, mavjud `previewFailed()` holati ko'rinadi.
Rasmlar o'zgarmaydi, ular ochiq.

**Blocked by:** 02 - Prod proxy va kontrakt manbai (E2E uchun `v9.1` API)

**Status:** ready-for-agent

- [ ] Media feature'ning mashq video DTO'sida `videoUrl`, mapper orqali modelga
- [ ] Bog'langan video uchun pleyer va yuklab olish havolasi `videoUrl` dan, bog'lanmagani uchun eski havoladan
- [ ] Havolani tanlash qoidasi store yoki model'da, shablonda emas
- [ ] Mapper va store testlari: bog'langan, bog'lanmagan, rasm
- [ ] `docs/modules/media.md` yangilangan (bog'lanmagan video cheklovi va backend so'roviga havola)
- [ ] E2E: `start:prod` da bog'langan video media sahifasida o'ynaydi, so'rov URL'ida `signature` bor
