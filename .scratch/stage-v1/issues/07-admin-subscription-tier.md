# 07: Admin: Trainer subscription'larda Tier

**What to build:**
Admin Trener obunalari jadvalida har obunaning Tier'ini ko'radi.
Faol obunada "VIP qilish" yoki "Standard qilish" tugmasi tasdiqdan keyin Tier'ni almashtiradi, muddat o'zgarmaydi.
Tugagan obunada tugma yo'q.
"Obuna berish" dialogi Standard ochishini va VIP jadvaldan berilishini aytadi.

**Blocked by:** 06

**Status:** resolved

- [x] Jadvalda "Tier" ustuni tag ko'rinishida.
- [x] Faqat faol obunada almashtirish tugmasi, tasdiq, toast va jadval yangilanishi.
- [x] `TrainerSubscription.NotFound` va `TrainerSubscription.NotActive` tushunarli matn bilan.
- [x] Grant dialogida "faqat Standard" izohi.
- [x] Service testi: to'g'ri yo'l va `{ tier }` tanasi; store va mapper testlari.
- [ ] Stage'da Sub User obunasi Standard'ga va qaytib VIP'ga almashtirildi.
- [x] Trainers moduli hujjati yangilangan.
- [x] `lint`, `test`, `test:coach`, `test:landing`, `build`, `build:coach` va `build:landing` o'tadi.
- [ ] Stage'da qo'lda E2E o'tdi, PR `main`ga merge qilindi, prod'ga hech narsa chiqmadi.

## Answer

The subscriptions table has a Tier tag column, and an active subscription gets one icon action ("VIP qilish" or "Standard qilish") that confirms, calls `PUT /admin/trainer-subscriptions/{id}/tier` with `{ tier }`, toasts and reloads; ended subscriptions get no action.
`TrainerSubscription` carries the shared `Tier` (`canChangeTier`, `targetTier`), the mapper reads a missing tier as Standard, `TrainerSubscription.NotFound` and `NotActive` have uz, ru and en texts, and the grant dialog shows an info message that it opens Standard only.
The two stage checkboxes stay open because nobody here has stage passwords. Commit `8696fde`.
