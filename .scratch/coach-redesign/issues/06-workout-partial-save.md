# 06 — Mashg‘ulot kunlarini qisman saqlash

**What to build:** Butun mashg‘ulot dasturini saqlashda ayrim kunlar muvaffaqiyatli, boshqalari xato bo‘lsa, trener qaysi o‘zgarishlar saqlanganini va qaysilari qolganini ko‘radi. Saqlanmagan qoralama yo‘qolmaydi; retry faqat bajarilmagan yoki undan keyin yana o‘zgargan write’larni yuboradi.

**Blocked by:** 05 — Mashg‘ulot dasturi va kun muharriri.

**Status:** ready-for-agent

## Acceptance criteria

- [ ] Kun yaratish, update va delete alohida API so‘rovlari ekanligi hisobga olinadi. UI hammasi atomik bajarilgandek tasdiq bermaydi.
- [ ] Pending/saving/saved/failed holatlar kunlar yoki tegishli o‘zgarishlar bo‘yicha tushunarli ko‘rsatiladi. Umumiy save xabari qisman muvaffaqiyatni yashirmaydi.
- [ ] Birinchi va ikkinchi kun saqlanib, uchinchisi xato bo‘lganda birinchi ikkitasi saqlangan sifatida, uchinchi kun failed/pending sifatida ko‘rinadi. Uchinchining qiymatlari o‘zgarmaydi.
- [ ] Muvaffaqiyatli create’dan qaytgan ID darhol qoralama bilan bog‘lanadi. Keyingi request xato bersa, retry muvaffaqiyatli yaratilgan kunni yana POST qilib ko‘paytirmaydi.
- [ ] Muvaffaqiyatli update dirty to‘plamidan olinadi; failed yoki hali yuborilmagan update’lar qoladi. Keyin yana o‘zgartirilgan saved kun qaytadan dirty bo‘ladi.
- [ ] Muvaffaqiyatli delete retry queue’dan olinadi. Xato bergan delete pending qoladi; uning UI ko‘rinishi noto‘g‘ri ravishda backenddan o‘chdi deb tasdiqlanmaydi.
- [ ] Deleted kun uchun failure feedback uning nomi/kontekstini yo‘qotmaydi. Retry operatsiya turi va haqiqiy ID’ni saqlaydi.
- [ ] Qisman failure’dan keyin butun plan’ni reload qilib saqlanmagan qiymatlar ustiga yozilmaydi. Server reconciliation faqat saqlangan natija va qoralama identifikatorlarini xavfsiz moslaydi.
- [ ] Retry avval muvaffaqiyatli bo‘lgan, qayta o‘zgarmagan write’larni yubormaydi. In-flight save paytida takroriy click yangi write seriyasini boshlamaydi.
- [ ] Saqlash paytida tahrir yoki bloklanadi, yoki aniq version-aware tarzda keyingi dirty o‘zgarish sifatida qoladi; kech natija yangi qiymatni saved deb noto‘g‘ri belgilamaydi.
- [ ] Cancel/chiqish tasdig‘i saqlanmagan qismga tegishli. Oldin backendda saqlangan kunlarni discard orqali qaytarilgandek ko‘rsatmaydi va ularni avtomatik rollback qilmaydi.
- [ ] Barcha qolgan write’lar muvaffaqiyatli tugagachgina umumiy dirty holat tozalanadi va to‘liq saqlangan xabar ko‘rsatiladi.
- [ ] Xato turi mavjud error class/code orqali boshqariladi. Foydalanuvchiga xom server message, token yoki maxfiy ma’lumot chiqarilmaydi.
- [ ] Kun holatlari, umumiy feedback va retry UZ/RU/EN, light/dark, desktop va mobil ko‘rinishda bir xil mazmunga ega.

## Verification

- [ ] Deterministik store testida uch write’dan dastlabki ikkitasi muvaffaqiyatli, uchinchisi failed qilinadi; retry faqat uchinchini chaqirishi isbotlanadi.
- [ ] Yangi kun POST muvaffaqiyatidan keyingi failure uchun duplicate-create regression testi bor.
- [ ] Update va delete muvaffaqiyat/failure kombinatsiyalari, saqlashdan keyingi yana tahrir va double-submit test qilinadi.
- [ ] Test failed qoralama qiymatlari, haqiqiy ID va pending write turi saqlanishini tekshiradi; faqat toast matnini tekshirish bilan cheklanmaydi.
- [ ] Brauzerda qisman failure → kunlar holati → retry → to‘liq saved natija oqimi ko‘rsatiladi.
- [ ] Repo lint, admin/coach testlari va builds hamda mobil/desktop vizual holatlar tekshiriladi.

## Boundaries

Backend atomik transaction, yangi bulk endpoint, autosave yoki server rollback kiritilmaydi. Mavjud ko‘p-so‘rovli kontrakt to‘g‘ri aks ettiriladi. Publication bu ticketni bloklamaydi; uning dirty/pending holatni tekshirishi mavjud muharrir holati bilan mos qolishi kerak.

## Demo

Ikki kun saqlanib, uchinchi kun failure bo‘ladi. Trener qisman natijani ko‘radi, uchinchining parametrlarini yo‘qotmasdan qayta saqlaydi; ilgari saqlangan kunlar request logida takrorlanmaydi.
