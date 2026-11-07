# Stage v1: frontend hisoboti

Sana: 2026-11-07.
Repo: `tofan-ui`, branch `feat/stage-v1` (hali `main` ga qo'shilmagan, push qilinmagan).
Qamrov: Tier (Standard, VIP), Tofan tariflari, Benefit'lar va Platform fee. Admin panel va Coach panel.

## Qisqa xulosa

Backend stage'ga chiqargan hamma yangilik admin va Coach panelda tayyor.
Hammasi `api.stage.peaktofan.com` bilan haqiqiy brauzerda sinaldi: `stage-admin` va `stage-coach` bilan.
Yetti gate (lint, test, test:coach, test:landing, build, build:coach, build:landing) o'tadi.
Prod panellarga hech narsa chiqmagan.

## Admin panel

### Narxlar (yangi menyu guruhi)

- **Platform fee** sahifasi: komissiya summasi (valyuta bilan), soliq foizi, to'lov provayderi foizi.
  Saqlashdan oldin tasdiq so'raladi.
  O'zgarish faqat keyingi to'lovlarga ta'sir qilishi aytilgan.
  Backend: `GET` va `PUT /admin/platform-fee`.
- **Tofan tariflari** sahifasi: Free, Standard, VIP kartalari.
  Har kartada oylik narx, o'quvchi to'laydigan jami narx, limitlar so'z bilan, AI chat bor-yo'qligi va Benefit'lar bor.
  Tahrirlash formasi: narx va limitlar, har nullable limit yonida "Cheksiz", "Hammasi ochiq" yoki "Almashmaydi" toggle'i.
  Free narxi nolda qulflangan.
  Har saqlashda yetti maydon ham yuboriladi, limit olib tashlansa `null` ketadi.
  Backend: `GET /tariffs`, `PUT /admin/tariffs/{type}`.
- **Benefit'lar muharriri** (Tariflar va Darajalar uchun umumiy): EN, RU, UZ matn, qo'shish, o'chirish, sudrab tartiblash va yuqoriga/pastga tugmalari.
  Har matn majburiy, ko'pi bilan 200 belgi, ko'pi bilan 20 qator.
  Benefit'lar oddiy matn ekani haqida ogohlantirish dialogda turadi.
  Backend: `PUT /admin/tariffs/{type}/benefits`.

### Trenerlar

- Ro'yxatda "VIP narxi" ustuni, VIP narxsiz trenerda bo'sh katak.
- Tahrir formasida ixtiyoriy VIP narx maydoni: to'ldirilgan holda ochiladi, bo'sh qoldirilsa "faqat Standard" degani.
- `vipMonthlyPrice` har saqlashda yuboriladi (son yoki `null`), shuning uchun ism, bio, rasm, email, telefon yoki narx o'zgarganda VIP narx jimgina o'chmaydi.
- "Darajalar" tabi: Standard va VIP kartalari va ularning Benefit'lari, umumiy muharrir bilan tahrirlanadi.
  Backend: `GET /public/trainer-tier-benefits`, `PUT /admin/trainer-tier-benefits/{tier}`.
- "Obunalar" tabi: Daraja ustuni, faol obunada "VIP qilish" yoki "Standard qilish" tugmasi (tasdiq bilan, muddat o'zgarmaydi).
  Tugagan obunada tugma yo'q.
  "Obuna berish" dialogi doim Standard ochishini va VIP jadvaldan berilishini aytadi.
  Backend: `PUT /admin/trainer-subscriptions/{id}/tier`.
- Trener komissiyasi foizi olib tashlandi (ustun, saralash, tugma, dialog, kod): backend endpoint'i o'chgan edi va 404 berardi.

## Coach panel

- Narx sahifasida ixtiyoriy VIP narx maydoni va izoh (VIP o'quvchilar chat qila oladi, bo'shatilsa hozirgi VIP o'quvchilarda chat obuna tugaguncha ishlaydi).
- Profilda narx `200 000 UZS / oy · VIP 400 000` ko'rinishida chiqadi.
- Har saqlashda (ism, bio, havola, rasm, narxlar) `vipMonthlyPrice` yuboriladi, VIP narx o'chmaydi.
- Mijozlar ro'yxatida va mijoz sahifasida VIP tegi.
- "Yozish" tugmasi faqat obunasi tugamagan VIP mijozda chiqadi.
- Chat faqat faol VIP bilan yoziladi.
  Standard mijoz bilan eski suhbat tarixi o'qiladi, composer o'rniga "Chat faqat faol VIP obunali sportchilar uchun ochiq" izohi turadi.
  `403 Chat.SubscriptionRequired` ochishda xato o'rniga read-only holat, yuborishda esa read-only holat va toast beradi.
  Yozilgan matn yo'qolmaydi: "Yuborilmagan xabar" blokida ko'rinib turadi.

## Umumiy (ikkala panelga ta'sir qiladi)

- Tier va MealType `libs/shared` ga ko'chirildi (DTO enum va enum map bilan), ikki app ham shuni ishlatadi.
- 403 javobi tuzatildi.
  Oldin har qanday 403 foydalanuvchini `/auth/access-denied` ga olib ketardi va xato kodi yo'qolardi.
  Endi biznes kodli 403 (masalan `Chat.SubscriptionRequired`) sahifada qoladi va kodi saqlanadi.
  Kodsiz yoki "Forbidden" sarlavhali 403 avvalgidek yo'naltiradi.
  Interceptor uchun test qo'shildi.
- Yangi xato kodlari uchta tilda (uz, ru, en) matn oldi: `Tariff.FreeMustStayFree`, `Tariff.PaidPriceRequired`, `Tariff.NotFound`, `TrainerSubscription.NotFound`, `TrainerSubscription.NotActive`, `Chat.SubscriptionRequired`.
- `start:staging` va `start:coach:staging` endi `api.stage.peaktofan.com` ga qaraydi va WebSocket'ni uzatadi.
  Proyekt hujjatlarida yopilgan eski server o'rniga stage manzili turadi.

## Sifat

- 13 ta ticket, shundan 12 tasi kod.
  62 ta commit, 237 fayl o'zgardi.
- 48 ta yangi spec fayli, taxminan 323 ta yangi test.
  Service testlari so'rov usuli, yo'li va to'liq tanasini tekshiradi (`vipMonthlyPrice: null`, yetti tarif maydoni, tartiblangan Benefit ro'yxati).
- Code review o'tkazildi (standartlar va spec bo'yicha ikki alohida o'qish), topilmalar tuzatildi.
- `docs/modules/` yangilandi: `trainers`, `coach`, `tariffs` (yangi), `platform-fee` (yangi), `benefits-dialog` (yangi).

## Stage'da sinalgan

- Admin: Platform fee (yuklash, tasdiqni bekor qilish, saqlash), tariflar (Free saqlash, Standard scan limitini "Cheksiz" qilib `null` va qaytarish), Benefit'larni sudrash va tugma bilan ko'chirish va saqlash, trener VIP narxini saqlash, bo'shatish va tiklash.
- Obuna Tier'i: Sub User Standard'ga va qaytib VIP'ga almashtirildi, muddat o'zgarmadi.
- Coach: VIP tegi, "Yozish" tugmasi VIP'da bor va Standard'da yo'q, Standard'da yuborish 403 beradi va chat read-only bo'ladi, VIP'ga qaytganda composer qaytadi.
- Coach narx sahifasi `vipMonthlyPrice: 400000` bilan saqlandi.
- Test tugagach stage ma'lumotlari asl holatiga qaytarildi (Sub User VIP, trener VIP narxi 400 000, Standard scan 15, Benefit tartiblari).

## Backend'ga savollar

1. `GET /tariffs` da `totalPrice` `monthlyPrice` ga teng chiqyapti (Standard 120 000, VIP 300 000), lekin Platform fee 50 000 UZS + 2%.
   Jami narx fee'ni o'z ichiga olishi kerakmi?
   Admin kartasida "O'quvchi to'laydigan jami narx" shu qiymatni ko'rsatadi.
2. `providerFeePercent` qanday hisoblanadi?
   Hujjat `admin-ui-platform-fee-v1.1.md` bizda yo'q, shu sababli Platform fee sahifasida namunaviy hisob yo'q.
3. Video limit birligi nima?
   Kartada hozir "N ta video ochiq" deb yozilgan, bu taxmin.
4. Chatda ism "Sub", Mijozlar ro'yxatida "Sub User".
   `otherUserName` faqat birinchi ismni qaytaryaptimi?
5. Swagger `Chat.SubscriptionRequired` 403 kodini hujjatlamaydi.
   Panel uni ishlaydi, lekin xato shakli Swagger'da ko'rinmaydi.

## Hali qilinmagan va ochiq masalalar

- `main` ga chiqarish usuli hal bo'lmagan: bitta PR yoki ticket branch'laridan alohida PR'lar.
  `main` stage'ga tushgani uchun kelishilmaguncha merge qilinmaydi.
- Stage'da sinalmaganlar: Standard yoki VIP narxini o'zgartirib saqlash, `Tariff.PaidPriceRequired` matni, stage'da Benefit qo'shish va o'chirish, Coach'da VIP narxni o'zgartirish.
- Reliz sanasi hali belgilanmagan.
  Reliz kunigacha prod panellarga hech narsa chiqmaydi.
- Kichik nomuvofiqlik: admin'da summalar `120,000 so'm` (vergul), Coach'da `200 000 UZS` (probel) ko'rinishida.
  Admin'da bu avvaldan shunday edi.
