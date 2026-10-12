# 07 — Takrorlanadigan ovqatlanish menyusi

**What to build:** Trener sana oralig‘iga tegishli takrorlanadigan ovqatlanish menyusini yaratadi va tahrirlaydi: ovqatlanish turi, sarlavha, ixtiyoriy vaqt, tanlangan ovqatlar va gramm miqdorlari bir joyda boshqariladi. Oziq qiymatlari miqdorga mos yangilanadi va aniq Saqlash bilan haqiqiy meal-plan API’ga yuboriladi.

**Blocked by:** 01 — Dasturlar ish maydoni va navigatsiya.

**Status:** ready-for-agent

## Acceptance criteria

- [ ] Yaratish mavjud meal-program kontraktiga mos sana oralig‘i va `meals` bilan ishlaydi. Backend qaytargan haqiqiy ID bo‘yicha muharrir ochiladi.
- [ ] Prototipdagi recurring mental model ravshan: shu menyu sana oralig‘ida takrorlanadi. Day selector, har kunga alohida menyu, o‘ylab topilgan plan nomi yoki per-day write maydoni kiritilmaydi.
- [ ] Detail response’dan sana oralig‘i, `isActive`, meals va items o‘qiladi. Loading, empty va xato/retry holatlari qoralama bilan aralashtirilmaydi.
- [ ] Sana oralig‘ini desktopda ham, mobil ekranda alohida sozlash mumkin. Sanalar va majburiy maydonlar mavjud kontrakt/form qoidalariga mos tekshiriladi.
- [ ] Ovqatlanish sarlavhasi, mavjud enum bo‘yicha `mealType`, ixtiyoriy `plannedTime` va display order boshqariladi. Bo‘sh vaqt `null`; backend time formatiga mos serializatsiya ishlatiladi.
- [ ] Ovqatlanish qo‘shish, tahrirlash va tarkibi bilan olib tashlash ishlaydi. Destructive amalning oqibati tushuntiriladi; cancel mavjud tarkibni saqlaydi.
- [ ] Food picker public catalog va owned foods manbalarini ajratadi. Har manbaning amaldagi read/search kontrakti ishlatiladi; mavjud bo‘lmagan parametrlarga tayanilmaydi.
- [ ] Mobil picker to‘liq ekran, qidiruv va multi-select’ga ega. Tanlangan haqiqiy food ID’lar aynan tanlangan ovqatlanishga qo‘shiladi; cancel hech narsa qo‘shmaydi.
- [ ] Owned food’ning bitta nomi va public catalog’ning localized nomlari locale bo‘yicha to‘g‘ri ko‘rsatiladi. Tahrirlash huquqi tanlash bilan aralashtirilmaydi.
- [ ] Miqdor grammda musbat qiymat sifatida tahrirlanadi. Porsiya kattaligi bilan quantity adashtirilmaydi; 100 g / 165 kcal ovqat uchun 200 g → 330 kcal kabi scaling to‘g‘ri.
- [ ] Har ovqatlanish va butun menyu uchun kaloriya, oqsil, uglevod va yog‘ jami tarkib asosida yangilanadi. Grafik yoki progress ko‘rsatkichlari hardcoded ulushlardan foydalanmaydi; frontend estimate backend-authoritative natija deb taqdim etilmaydi.
- [ ] Save payload faqat sana oralig‘i, `isActive`, meal parametrlari va item’ning `foodId`, `quantityGrams`, nullable `estimatedCost` maydonlarini yuboradi. Read-only ID/name/nutrition maydonlari write payload’iga sizmaydi.
- [ ] `estimatedCost` majburlanmaydi va nolga avtomatik aylantirilmaydi. Xarajat yoki yangi moliyaviy ko‘rsatkich kontraktsiz yaratilmaydi.
- [ ] Explicit Save, dirty holat, double-submit himoyasi va chiqishda discard tasdig‘i ishlaydi. Failed write qoralama, tanlangan foods, grammlar va sanalarni yo‘qotmaydi; retry shu qiymatlardan foydalanadi.
- [ ] Nashrdagi menyuda o‘zgarishlar faqat kelajakdagi obunachilarga qo‘llanishi ko‘rinadi. Mavjud mijozlarning nusxasi o‘zgargani va’da qilinmaydi.
- [ ] Coach Workspace v2 etaloni, Manrope, light/dark va UZ/RU/EN saqlanadi. Mobil ekranda asosiy vazifa bo‘lgan menyu tarkibi birinchi, jami va qo‘shimcha parametrlar qulay ikkilamchi joyda; Save doim ko‘rinadi.

## Verification

- [ ] Mapper/store testlari create va update payload farqini, recurring structure, nullable vaqt/xarajat va read-only fields yo‘qligini tekshiradi.
- [ ] Nutrition testlari porsiya/quantity scaling, nol makro, kasr gramm va bir nechta meal jami uchun ishlaydi.
- [ ] Picker, vaqt/sana sozlamalari, dirty guard, failed save → retry va qiymatlar saqlanishi integration test bilan tekshiriladi.
- [ ] Brauzerda yangi sana oralig‘i → ikki ovqatlanish → turli food manbalari → miqdor o‘zgartirish → save → qayta ochish desktop/mobilda bajariladi.
- [ ] Repo lint, admin/coach testlari va builds, ikkala theme va uch tildagi responsive/accessibility tekshiruvlari o‘tadi.

## Boundaries

04-ticket bu muharrirni bloklamaydi: mavjud owned-food read API bor. Per-day menu, individual mijoz rejasini yozish, autosave, yangi backend calculate endpoint yoki publication flow qo‘shilmaydi; publication 08-ticketda bajariladi.

## Demo

Trener bir hafta oralig‘i uchun nonushta va tushlik tuzadi, katalog va shaxsiy ovqatlarni tanlaydi, grammni o‘zgartirib hisobning yangilanishini ko‘radi va menyuni saqlab qayta ochadi.
