# 05 — Mashg‘ulot dasturi va kun muharriri

**What to build:** Trener yangi mashg‘ulot dasturini yaratadi, uning kunlarini boshqaradi, umumiy yoki shaxsiy katalogdan mashqlar tanlaydi va set/takror/dam/vazn parametrlarini aniq Saqlash bilan yuboradi. Desktopda kunlar paneli va tahrirlash maydoni yonma-yon, telefonda dastur → kun → mashqlar oqimi ishlaydi.

**Blocked by:** 01 — Dasturlar ish maydoni va navigatsiya.

**Status:** ready-for-agent

## Acceptance criteria

- [ ] Yaratish formasi mavjud workout create kontraktidagi nom, goal, experience level va home-workout parametrlarini yuboradi. Yaratilgach qaytgan haqiqiy ID bilan yangi dastur ochiladi.
- [ ] Bo‘sh dastur birinchi kun qo‘shishga yo‘naltiradi. Empty va yuklash/xato holatlari farqlanadi; boshqa plan’ning ma’lumoti vaqtincha ko‘rinmaydi.
- [ ] Plan va kunlar mavjud read xizmatlari orqali olinadi. Kun listing’ida tekshirilmagan plan filteri o‘ylab topilmaydi; mavjud paging natijalari tegishli `workoutPlanId` bo‘yicha ajratiladi.
- [ ] Kun yaratish/tahrirlash/olib tashlash amaldagi kun API’lari bilan ishlaydi. Create request’da plan ID mavjud, update request’da yo‘q. Day-of-week, split, title, rest va display order saqlanadi.
- [ ] Desktopdagi kun paneli tanlangan kun va tarkibini ko‘rsatadi. Mobil ekran avval kunlar ro‘yxatini, keyin faqat tanlangan kunni ochadi; orqaga qaytishda qoralama saqlanadi.
- [ ] Kun nomlari va mashqlar mavjud tartibda ko‘rsatiladi. Backend ruxsatiga asoslanmagan hafta kuni unikalligi yoki boshqa cheklov kiritilmaydi.
- [ ] Mashqlar mavjud kundan rest day’ga o‘tishda tarkib olib tashlanishi tushuntiriladi va tasdiqlanadi. Cancel tarkibni saqlab qoladi.
- [ ] Picker umumiy katalog va shaxsiy mashqlarni ajratadi, tanlangan manbada server qidiruvini ishlatadi va bir nechta mashqni tanlashga imkon beradi. Mobil picker to‘liq ekran ochiladi.
- [ ] Tanlangan haqiqiy exercise ID’lar aynan tanlangan kunga qo‘shiladi. Picker cancel hech narsani qo‘shmaydi; manba/qidiruv almashishi tanlangan yozuvlarni adashtirmaydi.
- [ ] Set son sifatida, takror `8–12` yoki boshqa mavjud string ko‘rinishida, dam soniyada, vazn son yoki `null` sifatida boshqariladi. Bo‘sh vazn nolga majburlanmaydi.
- [ ] Mashqni kun tarkibidan olib tashlash uning katalog yozuvini o‘chirmaydi. Write payload faqat tegishli exercise ID va contract-supported parametrlarni yuboradi.
- [ ] Formdagi o‘zgarishlar darhol HTTP write qilmaydi. Explicit Save yangi/o‘zgargan/olib tashlangan kunlar uchun tegishli write’larni bajaradi; takroriy submit bloklanadi.
- [ ] Saqlanmagan o‘zgarishlar bilan ichki navigatsiya discard tasdig‘iga ega; cancel shu qoralamani saqlaydi. Oddiy saqlash xatosida foydalanuvchi qiymatlari yo‘qolmaydi.
- [ ] Nashrdagi plan uchun o‘zgarishlar faqat kelajakdagi obunachilarga tegishli ekanligi ko‘rinadi. Mavjud mijoz nusxalari yangilangani haqida noto‘g‘ri xabar berilmaydi.
- [ ] Plan metadata’sini o‘zgartirish uchun tekshirilmagan write endpoint qo‘shilmaydi. Bu ticketdagi tahrir kun/tarkib kontrakti chegarasida qoladi.
- [ ] Coach Workspace v2 layout’i, Manrope, light/dark va UZ/RU/EN saqlanadi; mobil muharrirda Save doim qo‘l yetadigan joyda, inputlar klaviatura ochilganda yopilib qolmaydi.

## Verification

- [ ] Store testlari create/update/delete kun payload’larini, boshqa plan kunlarini ajratishni, explicit Save va failed-save draft saqlanishini tekshiradi.
- [ ] Picker integration testlari own/catalog search, multi-select, tanlangan kun, cancel va qaytishda qiymatlar saqlanishini tekshiradi.
- [ ] Null vazn va text takror kontrakti alohida regression test bilan isbotlanadi.
- [ ] Brauzerda yangi dastur → kun → mashqlar → parametrlar → save → serverdan qayta ochish desktop hamda mobil ko‘rinishda bajariladi.
- [ ] Repo lint, admin/coach testlari va builds, uch tildagi light/dark va accessibility tekshiruvlari o‘tadi.

## Boundaries

03-ticket bu ishni bloklamaydi: mavjud owned catalog API bor. Qisman muvaffaqiyatni kunlar bo‘yicha ko‘rsatish va retry semantikasi 06-ticketda, publication flow 08-ticketda yakunlanadi. Backend atomik/bulk endpoint yoki client-specific dastur boshqaruvi yaratilmaydi.

## Demo

Trener dastur yaratadi, kamida ikki kun qo‘shadi, har xil katalog manbalaridan mashqlar tanlaydi, takror oralig‘i va ixtiyoriy vaznni kiritadi, saqlaydi va dasturga qayta kirib natijani ko‘radi.
