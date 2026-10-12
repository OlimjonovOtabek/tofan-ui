# 11 — Mijozning ovqatlanish hisoboti

**What to build:** Trener tanlangan mijozning davr bo‘yicha kaloriya/makro iste’moli va maqsadlarini ko‘radi, bir kunni tanlab ovqat kundaligini ochadi. Sana filtrlari, empty va mustaqil failure/retry holatlari yangi desktop/mobile dizaynda ishlaydi.

**Blocked by:** 09 — Mijozlar ro‘yxati, profil va vazn hisoboti.

**Status:** ready-for-agent

## Acceptance criteria

- [ ] Nutrition va food-log read’lari amaldagi client API’lari bilan, tanlangan haqiqiy user ID uchun bajariladi. Trenerning template menyusi mijozning kundaligi o‘rniga ko‘rsatilmaydi.
- [ ] Nutrition davri mavjud FromDate/ToDate va timezone konvensiyasiga mos yuboriladi. Mavjud yetti kunlik default va tekshirilgan maksimal 92 kunlik oraliq cheklovi hurmat qilinadi.
- [ ] Food-log so‘rovi mavjud `date` query orqali aynan tanlangan kun uchun yuboriladi. Tanlanmagan yoki yashirin default sana UI’da boshqa kun deb ko‘rsatilmaydi.
- [ ] Har kunning consumed/target kaloriyasi, oqsil/uglevod/yog‘ actual va target qiymatlari hamda meals logged backend response’idan olinadi.
- [ ] Birliklar kcal va g sifatida aniq. Target nol yoki yo‘q holatda nolga bo‘lish va soxta goal completion yuz bermaydi; targetdan oshgan iste’mol yashirilmaydi.
- [ ] Progress va grafiklar haqiqiy qiymatlarga bog‘langan. UI bar’ining chegarasi bilan raw iste’mol qiymati farqlanadi; soxta hardcoded makro ulushlar ishlatilmaydi.
- [ ] Kun tanlanganda kundalikdagi localized food nomi, meal type, quantity grams, calories va mavjud makrolar o‘z log response’idan ko‘rsatiladi.
- [ ] Bir xil ovqat bir necha marta qayd etilgan bo‘lsa, alohida log ID’lari saqlanadi; UI ularni tasodifan bitta yozuv qilib yubormaydi.
- [ ] Nutrition report yoki kundalikda yozuv yo‘q bo‘lsa, shu holat tushuntiriladi. Trenerga mavjud bo‘lmagan client-log yaratish/tahrirlash/delete amali taklif qilinmaydi.
- [ ] Nutrition va food-log loading/xato holatlari mustaqil: birining failure’i muvaffaqiyatli boshqa blok va client profilini yashirmaydi. Retry faqat tegishli read’ni bajaradi.
- [ ] Kun, davr yoki client tez almashtirilganda kech response yangi tanlov ustiga yozilmaydi. Oldingi mijozning ovqat yozuvlari boshqa profilga aralashmaydi.
- [ ] Backend ownership yoki validation failure’lari confirmed error class/code orqali ko‘rsatiladi, message text business qoidasi sifatida ishlatilmaydi.
- [ ] Coach Workspace v2 etaloni, Manrope, light/dark va UZ/RU/EN saqlanadi. Mobil kun tanlash va kundalik drilldown’i o‘qilishi oson, numeric ma’lumotlar joydan toshmaydi.

## Verification

- [ ] Service/store testlari user/date/range/timezone query’lari, default/max interval, actual/target mapping va localized nomni tekshiradi.
- [ ] Nol target, targetdan oshgan iste’mol, bo‘sh kun, takroriy food log va kasr miqdor holatlari tekshiriladi.
- [ ] Mustaqil failure/retry va rapid day/client switch stale-response himoyasi isbotlanadi.
- [ ] Brauzerda client → Ovqatlanish → davr → tanlangan kun kundaligi → empty va retry holatlari ko‘rsatiladi.
- [ ] Repo lint, admin/coach testlari va builds, mobil/desktop va uch tildagi light/dark tekshiruvlari o‘tadi.

## Boundaries

07-ticket bu reportni bloklamaydi: hisobot backenddagi mijoz yozuvlarini o‘qiydi. Client kundaligini coach nomidan yozish, template’ni mijozga push qilish yoki nutrition policy’ni frontendda almashtirish qo‘shilmaydi.

## Demo

Trener mijozning hafta bo‘yicha iste’molini va maqsadlarini ko‘radi, bir kun kundaligini ochadi va boshqa kunga o‘tadi. Bo‘sh kun hamda report/log’dan birining xatosida qolgan ma’lumotlar saqlanishi ko‘rsatiladi.
