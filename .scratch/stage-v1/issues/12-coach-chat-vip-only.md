# 12: Coach panel: chat faqat VIP bilan

**What to build:**
Chat endi faqat faol VIP Client bilan yoziladi.
Read-only suhbat "Chat faqat faol VIP obunali sportchilar uchun ochiq" degan matnni ko'rsatadi va tarixni o'qishga qoldiradi.
Ochishda `403 Chat.SubscriptionRequired` kelsa xato o'rniga read-only holat chiqadi.
Yuborishda shu 403 kelsa suhbat read-only'ga o'tadi, yozilgan matn saqlanadi va tushunarli toast chiqadi.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Read-only matn uchala tilda yangilangan.
- [ ] Ochishdagi 403 read-only holat, umumiy xato emas.
- [ ] Yuborishdagi 403 read-only'ga o'tkazadi, qoralama qoladi, toast tushunarli.
- [ ] `Chat.SubscriptionRequired` xato matni uchala tilda.
- [ ] Conversation store testlari ikkala 403 holat uchun.
- [ ] Stage'da Sub User Standard bo'lganda yozish yopiq, tarix ko'rinadi.
- [ ] Coach moduli hujjati yangilangan.
- [ ] `lint`, `test`, `test:coach`, `test:landing`, `build`, `build:coach` va `build:landing` o'tadi.
- [ ] Stage'da qo'lda E2E o'tdi, PR `main`ga merge qilindi, prod'ga hech narsa chiqmadi.
