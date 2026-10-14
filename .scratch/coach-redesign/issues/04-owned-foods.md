# 04 — Shaxsiy ovqatlar katalogi

**What to build:** Trener Mening kontentim → Ovqatlar orqali o‘zi yaratgan ovqatlarni topadi, porsiya va oziq qiymatlari bilan yangi ovqat yaratadi, tahrirlaydi va tasdiqlab o‘chiradi. Mavjud menyuda ishlatilgan yoki ownership chekloviga tushgan yozuv uchun backend rad javobi qiymatlar va ro‘yxatni yo‘qotmasdan tushuntiriladi.

**Blocked by:** 01 — Dasturlar ish maydoni va navigatsiya.

**Status:** ready-for-agent

## Acceptance criteria

- [ ] Shaxsiy ovqatlar mavjud custom-food list kontraktidan olinadi. Umumiy food catalog va trainer-owned ma’lumotlari aralashtirilmaydi.
- [ ] Ro‘yxat qidiruvi list API’ning amaldagi imkoniyatiga mos ishlaydi; array endpoint uchun tekshirilmagan server paging yoki search parametri qo‘shilmaydi.
- [ ] Bo‘sh ro‘yxat birinchi ovqat yaratishga, qidiruvda natija yo‘qligi qidiruvni tozalashga, yuklash xatosi retry’ga yo‘naltiradi.
- [ ] Create, update va delete har biri o‘zining tekshirilgan endpointi bilan ishlaydi. Create va update bir xil yo‘lga ega deb taxmin qilinmaydi.
- [ ] Formada bitta non-blank `name`, `servingSizeGrams`, `caloriesPerServing`, oqsil, uglevod, yog‘ va ixtiyoriy `fiberGrams` mavjud. Own food kontraktida yo‘q localized nomlar yoki admin barcode maydonlari majburlanmaydi.
- [ ] Porsiya amaldagi form qoidasiga ko‘ra kamida 0.1 g; majburiy oziq qiymatlari null emas va manfiy bo‘lmaydi. Nol kaloriya/makro valid qiymat sifatida saqlanadi; bo‘sh fiber `null` bo‘ladi.
- [ ] Porsiyadagi kaloriya bilan 100 g qiymati adashtirilmaydi. Birliklar va qiymatlarning qaysi porsiyaga tegishli ekanligi UI’da ravshan.
- [ ] Trainer response’lari admin food mapper’ining cheklangan enumiga majburan o‘tkazilmaydi. Mavjud coach DTO/read fields ishlatiladi.
- [ ] Signal Forms va typed Optimus adapterlari touched/invalid/disabled holatlarni to‘g‘ri ko‘rsatadi. Saqlash xatosi nom va oziq qiymatlarini yo‘qotmaydi.
- [ ] O‘chirishdan oldin aynan qaysi ovqat olib tashlanishi ko‘rsatilgan tasdiq bor. Cancel hech qanday delete yubormaydi; yuborish paytida takroriy amal bloklanadi.
- [ ] Backend dependency yoki ownership sababli o‘chirishni rad etsa, yozuv ro‘yxatda qoladi va tushunarli error ko‘rsatiladi. Mavjud bo‘lmagan error code yoki message-text bo‘yicha business rule yaratilmaydi.
- [ ] Muvaffaqiyatli create/update/delete’dan keyin ro‘yxat server natijasi bilan mos yangilanadi.
- [ ] Coach Workspace v2, Manrope, light/dark va UZ/RU/EN qo‘llanadi. Mobil numeric keyboard, nol va kasr qiymatlar hamda uzun nomlar qulay ishlaydi.

## Verification

- [ ] Focused store/form testlari create/update/delete kontraktlarini, null/nol/kasr qiymatlarni, validation va server rad javobini tekshiradi.
- [ ] O‘chirishni bekor qilish request yubormasligi, rad javobida yozuv qolishi va retry’da qoralama saqlanishi tekshiriladi.
- [ ] Brauzerda ovqat yaratish → qayta ochish → oziq qiymatlarini o‘zgartirish → saqlash va delete tasdiqlash oqimi ko‘rsatiladi.
- [ ] Repo lint, admin/coach testlari va builds hamda mobil/desktop, uch til va ikkala theme tekshiriladi.

## Boundaries

Ovqatlanish muharriri bu ticketni bloklamaydi: u mavjud public/owned API’lardan foydalanishi mumkin. Admin oziq-ovqat katalogi, schema yoki backend hisoblash siyosati o‘zgartirilmaydi.

## Demo

Trener porsiyadagi kaloriya/makrolari bilan shaxsiy ovqat yaratadi, qidiradi, miqdorlarni tahrirlaydi va o‘chirishni tasdiqlaydi yoki bekor qiladi. Backend rad javobi ham alohida ko‘rsatiladi.
