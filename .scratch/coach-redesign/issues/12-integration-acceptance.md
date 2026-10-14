# 12 — To‘liq oqim va vizual qabul tekshiruvi

**What to build:** Coach redesign’ning barcha asosiy foydalanuvchi oqimlari birgalikda ishlashini isbotlash, desktop/mobile va light/dark ko‘rinishlarni tasdiqlangan etalon bilan solishtirish, haqiqiy API smoke dalillari va admin regressiya natijalarini tayyorlash. Topilgan integration nuqsonlari tegishli oqimda tor o‘zgarish bilan tuzatiladi.

**Blocked by:** 03 — Shaxsiy mashqlar va video yuklash; 04 — Shaxsiy ovqatlar katalogi; 06 — Mashg‘ulot kunlarini qisman saqlash; 08 — Dasturlarni nashr qilish va almashtirish; 10 — Mijozning mashg‘ulot hisoboti; 11 — Mijozning ovqatlanish hisoboti.

**Status:** ready-for-agent

## External prerequisites

Haqiqiy smoke uchun foydalanuvchi ruxsat bergan non-production API va zarur trainer/test hisoblari, trener kartasi hamda client hisobotlari uchun mavjud test obunasi kerak. Agar test obunasini yaratish talab qilinsa, aynan shu non-production amal oldindan ruxsatlangan bo‘lishi kerak. Credentials ticketga, screenshotga yoki logga yozilmaydi. Bu sharoit bo‘lmasa frontend tekshiruvlari bajariladi, lekin live API yoki yakuniy end-to-end qabul muvaffaqiyati deb e’lon qilinmaydi.

## Acceptance criteria

- [ ] Barcha leaf ticketlar acceptance va verification mezonlari bilan yakunlangan; faqat kod mavjudligi yoki fixture demo yetarli deb olinmaydi.
- [ ] Kirishdan Dasturlar ish maydoniga o‘tish, mavjud trainer-role/karta prerequisite’lari, access-denied va kartasi yo‘q holatlar amaldagi backend/auth siyosatiga mos ishlaydi.
- [ ] Profil/narx → avatar upload → save → qayta ochish oqimi haqiqiy ruxsatlangan test API bilan tekshiriladi.
- [ ] Shaxsiy mashq/video va shaxsiy ovqat yaratish/tahrirlash natijalari ro‘yxat va tegishli picker’larda ko‘rinadi. Ownership va dependency rad javoblari saqlanadi.
- [ ] Workout yaratish → kunlar → public/own mashqlar → parametrlash → explicit Save → qayta ochish oqimi ishlaydi.
- [ ] Qisman workout save, failed qoralama, retry’da muvaffaqiyatli write’larning takrorlanmasligi va duplicate create bo‘lmasligi uchun dalil bor.
- [ ] Takrorlanadigan meal menyusi → sana/vaqt → public/own food → grammlar → hisoblash → save → qayta ochish ishlaydi. Write payload’da per-day yoki read-only nutrition fields yo‘q.
- [ ] Ikkala dastur publication’i, replacement tasdig‘i va eski dastur qoralamaga qaytishi tekshiriladi. Mavjud mijoz nusxalarini o‘zgartirish va’da qilinmaydi yoki kontraktsiz amalga oshirilmaydi.
- [ ] Mavjud test client uchun profil/vazn, sessions/adherence, nutrition/food-log oqimlari, sana/status filtrlari, paging va mustaqil retry ishlaydi.
- [ ] Upload paytida ichki navigatsiya kutish yoki bekor qilib chiqishga ega. Bekor qilish amaldagi request’ni to‘xtatadi; keyingi screen yoki retry eski response/progress’dan buzilmaydi.
- [ ] Saqlanmagan qiymat bilan chiqish, save failure’da qoralama saqlanishi va loading/saving davridagi takroriy amal himoyasi barcha tegishli oqimlarda tekshiriladi.
- [ ] 360, 390, 430 va 1440 px ekranlar, light/dark hamda UZ/RU/EN uchun matn sig‘ishi, gorizontal page overflow, safe-area, virtual keyboard va fixed Save/nav joylashuvi tekshiriladi.
- [ ] Keyboard, fokus tartibi/restoration, dialog Escape/cancel, accessible names, matn kontrasti, statusning faqat rangga bog‘lanmasligi va mobil touch targetlar tekshiriladi.
- [ ] Lokal Manrope’ning lotin/kirill qamrovi va runtime tashqi font request yo‘qligi tasdiqlanadi. Tasdiqlangan v2 geometria, rang, tipografiya va oraliqlardan material farqlar ro‘yxatga olinadi va owner bilan hal qilinadi.
- [ ] Optimus API va theme tokenlari rasmiy hujjatlar bilan va o‘rnatilgan versiya bilan tekshirilgan; Signal Forms mavjud adapterlardan foydalanadi. Barcha user-facing matnlar uch tilga to‘liq tarjima qilingan.
- [ ] Repo lint, admin/coach testlari va production builds o‘tadi. Mavjud unrelated baseline failure bo‘lsa, uning oldindan mavjudligi dalil bilan ajratiladi va yakuniy gate yashirilmaydi.
- [ ] Shared upload, forms, theme yoki i18n o‘zgarishlari uchun tegishli admin regressiya oqimlari tekshiriladi. Admin auth va boshqaruv imkoniyatlari yo‘qolmaydi.
- [ ] Production ilovada prototype fixture, fake login, review toolbar yoki namuna request inspector yo‘q. Real API ishlagani fixture-based test yoki Lighthouse score bilan almashtirib da’vo qilinmaydi.
- [ ] Ruxsatlangan test ma’lumotlari bilan desktop/mobile vizual dalillar, bajarilgan gate natijalari, live smoke natijalari, cheklovlar va qolgan blockerlar yakuniy hisobotda qayd etiladi.

## Verification

- [ ] Tor testlar ticketlar davomida o‘tgan; bu ticket yakuniy integration va regression gate’larini qayta tekshiradi. Faqat xato yoki yangi tuzatish sabab bo‘lgan tekshiruvlar qo‘shimcha takrorlanadi.
- [ ] Haqiqiy API bilan response/payload va browser interaction dalillari tekshiriladi; servis mock’lari live smoke natijasi sifatida ko‘rsatilmaydi.
- [ ] Visual review muvaffaqiyatli va xato/empty/loading/saving/partial-save holatlarini ham qamrab oladi.
- [ ] Har qolgan muammo uchun severity, takrorlash sharti, foydalanuvchiga ta’sir va tavsiya etilgan keyingi qadam qayd etiladi.
- [ ] Har UI slice uchun qaytarish yo‘li aniq: tegishli UI diffni qaytarish; backend schema/data migratsiyasi talab qilinmaydi. Shared o‘zgarishlarni qaytarishning admin/coach caller’lariga ta’siri qayd etiladi.

## Boundaries

Bu ticket production deploy, commit/push, schema migration, credential o‘zgartirish yoki ruxsatlanmagan tashqi mutatsiyani o‘z ichiga olmaydi. Test API yoki hisoblar yetishmasa live acceptance ochiq qoladi va zarur prerequisite aniq yoziladi. Tasdiqlangan scope’dan tashqari yangi feature yoki keng rewrite qo‘shilmaydi.

## Demo

Ruxsatlangan test trener desktop va mobil ko‘rinishda profil/kontent yaratadi, ikki dastur tuzadi va nashr qiladi; mavjud test mijoz hisobotlarini tekshiradi. Qisman save va upload cancel/retry holatlari ham ko‘rsatiladi. Natija vizual etalon va haqiqiy API dalillari bilan birga topshiriladi.
