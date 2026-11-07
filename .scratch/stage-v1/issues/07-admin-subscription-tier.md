# 07: Admin: Trainer subscription'larda Tier

**What to build:**
Admin Trener obunalari jadvalida har obunaning Tier'ini ko'radi.
Faol obunada "VIP qilish" yoki "Standard qilish" tugmasi tasdiqdan keyin Tier'ni almashtiradi, muddat o'zgarmaydi.
Tugagan obunada tugma yo'q.
"Obuna berish" dialogi Standard ochishini va VIP jadvaldan berilishini aytadi.

**Blocked by:** 06

**Status:** ready-for-agent

- [ ] Jadvalda "Tier" ustuni tag ko'rinishida.
- [ ] Faqat faol obunada almashtirish tugmasi, tasdiq, toast va jadval yangilanishi.
- [ ] `TrainerSubscription.NotFound` va `TrainerSubscription.NotActive` tushunarli matn bilan.
- [ ] Grant dialogida "faqat Standard" izohi.
- [ ] Service testi: to'g'ri yo'l va `{ tier }` tanasi; store va mapper testlari.
- [ ] Stage'da Sub User obunasi Standard'ga va qaytib VIP'ga almashtirildi.
- [ ] Trainers moduli hujjati yangilangan.
- [ ] `lint`, `test`, `test:coach`, `test:landing`, `build`, `build:coach` va `build:landing` o'tadi.
- [ ] Stage'da qo'lda E2E o'tdi, PR `main`ga merge qilindi, prod'ga hech narsa chiqmadi.
