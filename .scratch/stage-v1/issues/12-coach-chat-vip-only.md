# 12: Coach panel: chat faqat VIP bilan

**What to build:**
Chat endi faqat faol VIP Client bilan yoziladi.
Read-only suhbat "Chat faqat faol VIP obunali sportchilar uchun ochiq" degan matnni ko'rsatadi va tarixni o'qishga qoldiradi.
Ochishda `403 Chat.SubscriptionRequired` kelsa xato o'rniga read-only holat chiqadi.
Yuborishda shu 403 kelsa suhbat read-only'ga o'tadi, yozilgan matn saqlanadi va tushunarli toast chiqadi.

**Blocked by:** 01

**Status:** resolved

- [x] Read-only matn uchala tilda yangilangan.
- [x] Ochishdagi 403 read-only holat, umumiy xato emas.
- [x] Yuborishdagi 403 read-only'ga o'tkazadi, qoralama qoladi, toast tushunarli.
- [x] `Chat.SubscriptionRequired` xato matni uchala tilda.
- [x] Conversation store testlari ikkala 403 holat uchun.
- [x] Stage'da Sub User Standard bo'lganda yozish yopiq, tarix ko'rinadi.
- [x] Coach moduli hujjati yangilangan.
- [x] `lint`, `test`, `test:coach`, `test:landing`, `build`, `build:coach` va `build:landing` o'tadi.
- [ ] Stage'da qo'lda E2E o'tdi, PR `main`ga merge qilindi, prod'ga hech narsa chiqmadi.

## Answer

Chat 403 `Chat.SubscriptionRequired` endi xato emas, read-only holat: ochishda tarixsiz read-only matn, yuborishda read-only'ga o'tish, toast va saqlanib qolgan qoralama.
Buning uchun umumiy HTTP qatlami o'zgardi: `sessionInterceptor` biznes kodi bor 403'ni `/auth/access-denied`ga yo'naltirmaydi, `AccessDeniedError` `code` va `messages`ni saqlaydi, Result envelope va `ErrorType.Forbidden` (5) o'qiladi; kodsiz 403 avvalgidek yo'naltiradi.
Commit: `ddb0f78`. Stage'dagi qo'lda tekshiruv (Sub User Standard bo'lganda yozish yopiq, tarix ko'rinadi) bajarilmagan: stage parollari yo'q.
