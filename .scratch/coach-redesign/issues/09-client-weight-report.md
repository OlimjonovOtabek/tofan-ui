# 09 — Mijozlar ro‘yxati, profil va vazn hisoboti

**What to build:** Trener faol mijozlarini yangi desktop/mobile ro‘yxatda ko‘radi, bir mijozning profiliga kiradi va uning obunasi, mavjud/maqsad vazni hamda tanlangan davrdagi vazn tarixini tekshiradi. Yetishmagan ma’lumot, ruxsat rad javobi va mustaqil report xatolari tushunarli ko‘rsatiladi.

**Blocked by:** 01 — Dasturlar ish maydoni va navigatsiya.

**Status:** ready-for-agent

## Acceptance criteria

- [ ] Mijozlar ro‘yxati amaldagi coach clients API’dan olinadi; faqat backend qaytargan faol obunachilar ko‘rsatiladi. Admin barcha-user ro‘yxati yoki impersonation ishlatilmaydi.
- [ ] Desktopda skanerlash oson ro‘yxat, mobil ekranlarda o‘qilishi qulay kartalar va aniq report amali bor. Qidiruv array kontraktiga mos; o‘ylab topilgan paging/query endpointi yo‘q.
- [ ] Listda ism, mavjud summary goal, vazn, target vazn va obuna sanalari ishlatiladi. Summary’da yo‘q adherence, revenue yoki umumiy trend ko‘rsatkichlari yaratilmaydi.
- [ ] Bo‘sh list faol mijozlar hali yo‘qligini tushuntiradi; trenerga unsupported mijoz yaratish/obuna berish tugmasi taklif qilinmaydi.
- [ ] Client detail haqiqiy user ID bilan o‘qiladi. Profil va subscription summary bir mijozga tegishli ekanligi saqlanadi; backend cheklovlari UI hiding bilan almashtirilmaydi.
- [ ] Nullable vazn, target, goal yoki boshqa ixtiyoriy facts kiritilmagan holat sifatida ko‘rsatiladi. `null` nol vazn yoki soxta progressga aylantirilmaydi.
- [ ] Vazn tarixi mustaqil read API’dan, amaldagi From/To va timezone konvensiyasi bilan olinadi. Sana tanlash va valid interval mavjud xizmat kontraktiga mos ishlaydi.
- [ ] Grafik haqiqiy vazn nuqtalaridan hosil qilinadi; x/y o‘qlari, sana tartibi, kg birligi va o‘lchangan diapazon to‘g‘ri. Bitta nuqta va bir xil qiymatlarda nolga bo‘lish yoki soxta trend bo‘lmaydi.
- [ ] Grafikda natija bo‘lmasa, vazn hali kiritilmagani tushuntiriladi. Report failure profil va obuna ma’lumotlarini yashirmaydi; faqat tegishli blokni retry qilish mumkin.
- [ ] Sana oralig‘i yoki mijoz tez almashtirilganda eski response yangi tanlov ustiga yozilmaydi. Yangi mijoz ochilishida oldingi mijozning ma’lumotlari ko‘rinib qolmaydi.
- [ ] Inaccessible/nonexistent client holati mavjud error class/confirmed code orqali tushuntiriladi. Ruxsatsiz ma’lumotni boshqa endpoint orqali aylanib olishga urinish yo‘q.
- [ ] Vazn, Mashg‘ulot va Ovqatlanish report tablari yangi dizaynga mos; boshqa mavjud reportlar o‘chirib tashlanmaydi. 10 va 11-ticketlar ularni alohida yakunlaydi.
- [ ] Manrope, light/dark va UZ/RU/EN saqlanadi. Mobil client header/summary grafikni siqmaydi; kontrast, grafikning accessible mazmuni va klaviatura bilan sana/tab boshqaruvi ishlaydi.

## Verification

- [ ] Store/service testlari profil/list/weight muvaffaqiyat va mustaqil xatolar, to‘g‘ri user ID, query/timezone va nullable values’ni tekshiradi.
- [ ] Grafik helper testlari empty, bir nuqta, teng vazn, tartib va haqiqiy diapazonni tekshiradi.
- [ ] Rapid client/range switch testi kech natija yangi tanlovga o‘tmasligini isbotlaydi.
- [ ] Brauzerda mijoz qidirish → detail → vazn davrini almashtirish → empty/retry holatlari desktop/mobilda ko‘rsatiladi.
- [ ] Repo lint, admin/coach testlari va builds, uch tildagi ikkala theme va responsive/accessibility tekshiruvlar o‘tadi.

## Boundaries

Bu ticket workout yoki meal muharrirlarini kutmaydi: client report API’lari mavjud. Trener mijoz nomidan vazn yoki shaxsiy dastur yozmaydi. Backend ruxsati va mavjud auth flow o‘zgartirilmaydi.

## Demo

Trener faol mijozni topadi, obuna va vazn ma’lumotlarini ko‘radi, sana oralig‘ini o‘zgartiradi. Vazn kiritilmagan mijoz va weight API failure’da boshqa profil ma’lumotlari qolishi alohida ko‘rsatiladi.
