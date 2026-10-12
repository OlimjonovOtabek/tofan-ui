# 10 — Mijozning mashg‘ulot hisoboti

**What to build:** Trener tanlangan mijozning mashg‘ulot seanslari va rejaga amal qilishini ko‘radi. Sana/holat filtrlari, keyingi seanslarni yuklash, rejalashtirilgan/bajarilgan/qoldirilgan/dam olish kunlari va mustaqil report retry yangi dizaynda ishlaydi.

**Blocked by:** 09 — Mijozlar ro‘yxati, profil va vazn hisoboti.

**Status:** ready-for-agent

## Acceptance criteria

- [ ] Mashg‘ulot reporti aynan tanlangan client ID uchun amaldagi workout-sessions va adherence API’laridan olinadi. Client list uchun aggregate statistik endpointi yaratilmaydi.
- [ ] Sessions response’ining Result envelope va nested paged list shakli to‘g‘ri o‘qiladi: mavjud ApiClient unwrap’dan keyin ichki list bir marta map qilinadi, double unwrap bo‘lmaydi.
- [ ] Sana oralig‘i va optional Status qiymati mavjud query nomlari va enumlariga mos yuboriladi. Clear status noto‘g‘ri `0` filtriga aylanmaydi.
- [ ] Hisobotning mavjud timezone header va sana chegaralari konvensiyasi saqlanadi; UTC/local konversiya kunlarni noto‘g‘ri surmaydi.
- [ ] Seansda backend qaytargan kun sarlavhasi, status, sana va mavjud davomiylik/mashq/set/volume ma’lumotlari o‘z birligi bilan ko‘rinadi. Yo‘q qiymat yoki unknown status tasodifiy completed holatga aylanmaydi.
- [ ] Keyingi seanslarni yuklash mavjud server paging kontrakti bilan ishlaydi. Amaldagi result metadata’sidan next/has-more olinadi; tugagan list uchun yana yuklash va duplicate paging oldi olinadi.
- [ ] Filtr o‘zgarsa sessions birinchi sahifaga qaytadi. Oldingi filtrning kech page response’i yangi ro‘yxatga qo‘shilmaydi; takroriy yozuvlar paydo bo‘lmaydi.
- [ ] Adherence backenddagi `scheduledDays`, `completedDays`, `missedDays`, `restDays`, `adherencePercent` va kun flaglari asosida ko‘rsatiladi. Rest, missed va session holatlari aralashtirilmaydi.
- [ ] Nol rejalashtirilgan kun yoki bo‘sh report uchun noto‘g‘ri foiz/trend o‘ylab topilmaydi. Backend qaytargan actual date range ko‘rsatiladi.
- [ ] Sessions va adherence yuklash/xato/empty holatlari mustaqil. Sessions failure mavjud adherence/profilni yashirmaydi; adherence failure seanslarni yashirmaydi.
- [ ] Retry tegishli blokning read’ini takrorlaydi; mijozning seans holatini write orqali o‘zgartirmaydi.
- [ ] Client almashganda oldingi seans va adherence state’i yangi mijoz uchun ko‘rinib qolmaydi. Ownership rad javobi amaldagi feedback konvensiyasiga mos.
- [ ] Coach Workspace v2 uslubi, Manrope, light/dark va UZ/RU/EN qo‘llanadi. Mobil seanslar keng jadvalga majburlanmaydi; sana/status va load-more amallari qulay boshqariladi.

## Verification

- [ ] Response-shape testi haqiqiy nested list kontraktini, to‘g‘ri total/page mapping va status query’ni tekshiradi.
- [ ] Paging testlari append, oxirgi sahifa, filter reset, duplicate submission va stale response’ni tekshiradi.
- [ ] Adherence testlari completed/missed/rest flaglari, nol/empty ma’lumotlar va mustaqil failure/retry’ni tekshiradi.
- [ ] Brauzerda client → Mashg‘ulot → sana/status filtri → yana yuklash → tegishli blok retry oqimi ko‘rsatiladi.
- [ ] Repo lint, admin/coach testlari va builds, ikkala theme, uch til va mobil/desktop tekshiruvi o‘tadi.

## Boundaries

05-ticket bu reportni bloklamaydi: client report API’lari mavjud. Seanslarni tahrirlash, qayta hisoblash, activate yoki mijozga dastur assign qilish imkoniyati qo‘shilmaydi.

## Demo

Trener mijozning seanslarini status va davr bo‘yicha filtrlaydi, keyingi sahifani yuklaydi va adherence kunlarini tekshiradi. Sessions va adherence’dan bittasi failed bo‘lganda ikkinchisi qolishi ko‘rsatiladi.
