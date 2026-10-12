# 03 — Shaxsiy mashqlar va video yuklash

**What to build:** Trener Mening kontentim → Mashqlar orqali o‘z mashqlarini topadi, uch tildagi nom va mashq parametrlarini kiritib yaratadi yoki tahrirlaydi. Video tanlash, yuklash, progress, retry va yuklash paytida navigatsiyani tasdiqlash yangi desktop/mobile dizaynda ishlaydi.

**Blocked by:** 01 — Dasturlar ish maydoni va navigatsiya; 02 — Trener profili va avatar yuklash.

**Status:** ready-for-agent

## Acceptance criteria

- [ ] Ro‘yxat coach-owned mashqlar kontraktidan olinadi. Umumiy katalog o‘z mashqlari sifatida ko‘rsatilmaydi; umumiy katalogga admin CRUD amallari qo‘shilmaydi.
- [ ] Qidiruv mavjud `Search` va paged query kontrakti bo‘yicha ishlaydi. Natijadagi ko‘rsatilgan yozuv soni backenddagi jami deb noto‘g‘ri talqin qilinmaydi.
- [ ] Loading, haqiqiy bo‘sh ro‘yxat, qidiruvda natija yo‘qligi va xato/retry uchun turli, yo‘naltiruvchi holatlar bor.
- [ ] O‘z mashqini yaratish va ID bo‘yicha tahrirlash amaldagi coach exercise kontraktiga mos. UZ/RU/EN nomlarining barchasi majburiy va non-blank.
- [ ] Mushak guruhi, jihoz, murakkablik, mashq turi va jins enum qiymatlari mavjud DTO/options’dan olinadi. Compound/home parametrlari, ixtiyoriy ko‘rsatma va nullable video ID yo‘qolmaydi.
- [ ] Video MP4, M4V, MOV yoki WebM, 200 MB gacha va bo‘sh bo‘lmagan fayl sifatida tekshiriladi. Rad etilgan fayl yuborilmaydi; boshqa forma qiymatlari saqlanadi.
- [ ] Haqiqiy upload ExerciseVideo kategoriyasi bilan bajariladi. Progress va qayta urinish ko‘rinadi; tekshirilgan file ID mashq save payload’iga bog‘lanadi.
- [ ] Oldingi video saqlanadi, yangi upload muvaffaqiyatsiz bo‘lganda u yo‘qotilmaydi. Formaning boshqa qiymatlari ham xatoda qoladi.
- [ ] 02-ticketdagi umumiy cancellation imkoniyati qayta ishlatiladi: upload paytida chiqish kutish yoki bekor qilib chiqishga ega; bekor qilingandan keyin kech natija boshqa mashqqa bog‘lanmaydi.
- [ ] Yuklash/save vaqtida takroriy yuborish oldi olinadi. Backend ownership yoki validation rad javobi amaldagi error class/code bilan tushunarli ko‘rsatiladi.
- [ ] Mavjud kontraktda yo‘q coach exercise delete, deactivation yoki boshqa admin amali taklif qilinmaydi.
- [ ] Forma Signal Forms va mavjud typed Optimus wrapper’lariga mos. Mobil tahrirlash yetarli maydonli to‘liq ekran ko‘rinishga ega, desktopda forma va ro‘yxat tartibi ravshan.
- [ ] Coach Workspace v2 vizual etaloni, Manrope, light/dark va UZ/RU/EN saqlanadi. Uzoq nomlar, video yo‘qligi, klaviatura/fokus va touch targetlar tekshiriladi.

## Verification

- [ ] Store/form testlari uch tildagi nomlar, to‘liq create/update payload, server qidiruvi va ownership xatolarini tekshiradi.
- [ ] Video testlari limit/format, kategoriya, response ID, xatoda eski video/qoralama, retry va cancel/race holatlarini tekshiradi.
- [ ] Upload cancel’dan keyin boshqa mashqni ochish eski natijani unga qo‘llamasligi isbotlanadi.
- [ ] Brauzerda yaratish → video upload → save → qayta ochish hamda tahrirlash → upload xatosi → retry namoyish qilinadi.
- [ ] Repo lint, admin/coach testlari va builds, mobil/desktop va uch tildagi light/dark tekshiruvlar o‘tadi.

## Boundaries

Bu ticket mashg‘ulot dasturi muharririni kutmaydi yoki o‘zgartirmaydi. Uning natijasi mavjud owned exercise API orqali muharrir picker’iga mavjud bo‘ladi. Resumable/background upload, yangi delete endpoint yoki umumiy katalog tahriri kiritilmaydi.

## Demo

Trener shaxsiy mashq yaratadi, uch tildagi nomlarni va video faylni saqlaydi, ro‘yxatdan qidiradi, keyin tahrirlaydi. Upload davomida chiqish tasdig‘i va xatodan qayta urinish alohida ko‘rsatiladi.
