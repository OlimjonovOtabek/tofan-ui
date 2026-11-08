# Stage v1.1: 6-bo'lim sinov hisoboti

Sana: 2026-11-08

## Muhit

- Admin: lokal panel, `npm run start:staging` (`http://localhost:4200`), stage API `https://api.stage.peaktofan.com`, `stage-admin` bilan kirilgan.
- Coach: `coach.stage.peaktofan.com`, image `v1.5`, `stage-coach` bilan kiriladi.
- Branch: `feat/stage-v1-1-backend-answers`, sinov boshlanishidan oldingi commit `2d9a5e4`.
- Tekshiruv: lokal admin stage'ni ko'rsatmoqda (To'lov buyurtmalari ro'yxati: jami 7 ta buyurtma).

## Qoida

Har qiymat o'zgartirilishidan oldin shu yerga yoziladi, sinovdan keyin tiklanadi va read-back qilinadi.
Sinov uchun yaratilgan narsalar o'chiriladi.

## 1. Tariff narxi va `Tariff.PaidPriceRequired`

Vaqtlar Toshkent vaqti (UTC+5).

- Boshlang'ich qiymat (23:15:57): Free 0, Standard 120 000, VIP 300 000 so'm.
- Tiklangan qiymat: Standard 120 000 (23:18:38), VIP 300 000 (23:18:39); Free'ga tegilmagan (0).
- Vaqt: Standard +1 000 taxminan 23:16-23:17 saqlangan, VIP +1 000 saqlangan 23:17:12; ikkalasi 23:18:38-23:18:39 gacha stage'da turdi (taxminan 1-2 daqiqa).
- Qadamlar:
  1. Standard dialogida narxga 0 kiritildi, "Saqlash" bosildi.
  2. Standard 121 000 qilindi, saqlandi (`PUT /api/admin/tariffs/2` 200).
  3. VIP dialogida 0 kiritildi, "Saqlash" bosildi.
  4. VIP 301 000 qilindi, saqlandi (`PUT /api/admin/tariffs/3` 200).
  5. Sahifa yangilandi: VIP kartasi 301 000 so'm; `GET /tariffs` Standard 121 000, VIP 301 000 qaytardi.
  6. Kirilgan admin sahifasidan o'z tokeni bilan `PUT /api/admin/tariffs/2` yuborildi, `monthlyPrice: 0`.
  7. Ikkala narx asl qiymatga qaytarildi; `GET /tariffs` read-back: Free 0, Standard 120 000, VIP 300 000.
- Kutilgan natija: forma 0 narxni to'xtatadi, narx yangilangandan keyin saqlanib turadi, backend 0 narxni `Tariff.PaidPriceRequired` bilan rad etadi.
- Haqiqiy natija:
  - Forma (Standard va VIP): "Narx 0 dan katta bo'lishi kerak." xatosi uz tilida chiqdi, so'rov ketmadi (network logda yangi `PUT` yo'q).
  - Read-back: yangi narxlar yangilangandan keyin ham qaytdi.
  - Backend 0 narxni rad etdi (quyida), narx o'zgarmadi.
  - Free Tariff'ga tegilmadi.
- Backend rad javobi:
  - So'rov: `PUT /api/admin/tariffs/2` (stage'da `/admin/tariffs/2`), body `{"monthlyPrice":0,"foodScanLimit":15,"workoutVideoLimit":null,"dietMealTypes":null,"workoutChangeMonths":2,"dietChangeDays":7,"hasAiTrainerChat":false}`.
  - HTTP status: 400.
  - `title`: `Tariff.PaidPriceRequired`.
  - `detail`: "A paid tariff must have a monthly price above zero."
  - `messages`: en, uz ("Pullik tarifning oylik narxi noldan katta bo'lishi kerak."), ru.
  - `traceId`: `00-9e409b638446d4cff8eb68f888a226a7-4db2098b389d6034-00`.
- Eslatmalar:
  - Spec'da maydon `price` deyilgan, haqiqiy so'rov maydoni `monthlyPrice`.
  - ProblemDetails'da alohida `code` maydoni yo'q, kod `title` ichida keladi (panel `title`dan `code` oladi).
  - Backend rad javobining admin tilida ko'rinishi (6-hikoya) UI orqali sinalmadi: forma 0 narxni backend'ga yetkazmaydi. Bu `error-message.ts` unit testlari bilan yopilgan.

## 2. Benefit (Tariff va Trener Tier)

Vaqtlar Toshkent vaqti (UTC+5).

- Boshlang'ich qiymat (23:19:10), matni `name / nameRu / nameUz` va tartibi:
  - Standard Tariff (4 ta):
    1. 15 food scans per month / 15 сканирований еды в месяц / Oyiga 15 marta ovqat skaneri
    2. Full workout and diet plan / Полный план тренировок и питания / To'liq mashq va ovqatlanish rejasi
    3. New workout every 2 months / Новая программа тренировок каждые 2 месяца / Har 2 oyda yangi mashq dasturi
    4. New diet plan every week / Новый план питания каждую неделю / Har hafta yangi ovqatlanish rejasi
  - Standard Tier (2 ta, tier `1`):
    1. The coach's workout programs / Программы тренировок тренера / Murabbiyning mashq dasturlari
    2. The coach's diet programs / Программы питания тренера / Murabbiyning ovqatlanish dasturlari
- Tiklangan qiymat: ikkala ro'yxat ham yuqoridagi matn va tartibda; read-back Tariff 23:21:48, Tier 23:23:59. VIP Tier va boshqa Tariff'larning Benefit'lariga tegilmagan.
- Vaqt:
  - Standard Tariff: "Stage test" 23:20:02 da saqlangan, 23:21:48 gacha stage'da turdi.
  - Standard Tier: "Stage test" 23:23:05 da saqlangan, 23:23:59 gacha stage'da turdi.
- Qadamlar (Tariff va Tier uchun bir xil):
  1. Imtiyozlar dialogi ochildi, "Imtiyoz qo'shish" bosildi, qator bo'sh qoldirilib "Saqlash" bosildi.
  2. Inglizcha maydonga 201 ta belgi kiritildi ("Stage test" ru/uz bilan), "Saqlash" bosildi.
  3. Uch tilda "Stage test" yozilib saqlandi, sahifa yangilandi, ro'yxat tekshirildi.
  4. "Stage test" yuqoriga surildi (Tariff: 5-o'rindan 3-o'ringa; Tier: 3-o'rindan 2-o'ringa), saqlandi, sahifa yangilandi, tartib tekshirildi.
  5. "Stage test" o'chirildi, saqlandi, sahifa yangilandi, ro'yxat boshlang'ich holat bilan solishtirildi.
- Kutilgan natija: bo'sh va 201 belgili qator saqlanishdan oldin bloklanadi; qo'shish, surish, o'chirish backend'da saqlanadi va read-back'da shu tartibda qaytadi.
- Haqiqiy natija:
  - Bo'sh qator: "Matnni kiriting." xatosi chiqdi, so'rov ketmadi (ikkala joyda).
  - 201 belgi: "Matn 200 belgidan oshmasin." xatosi chiqdi, so'rov ketmadi (ikkala joyda).
  - Qo'shish: `PUT /api/admin/tariffs/2/benefits` 200 va `PUT /api/admin/trainer-tier-benefits/1` 200; read-back'da "Stage test" oxirgi o'rinda.
  - Surish: ikkala `PUT` 200; read-back'da yangi tartib (Tariff: 1, 2, Stage test, 3, 4; Tier: 1, Stage test, 2).
  - O'chirish: ikkala `PUT` 200; read-back'da ro'yxat boshlang'ich holat bilan bir xil.
- Xatolar (HTTP status, `title`, `code`, so'rov body'si): backend xatosi bo'lmadi.
- Eslatmalar:
  - Trener Tier'lari butun platforma uchun umumiy (`GET /public/trainer-tier-benefits`, `PUT /admin/trainer-tier-benefits/{tier}`), bitta Trener'ga tegishli emas; "Stage Coach'ning Standard Tier'i" deganda umumiy Standard Tier tushunildi.
  - Tariff'dagi birinchi o'chirish saqlashi sinov brauzeri sahifani darrov yangilagani uchun bekor bo'ldi (so'rov javobsiz qoldi), "Stage test" stage'da qoldi; keyingi urinishda saqlash 200 qaytardi va qator o'chdi. Bu panel xatosi emas.

## 3. Coach VIP narxi

Vaqtlar Toshkent vaqti (UTC+5). Muhit: `coach.stage.peaktofan.com`, `stage-coach`; foydalanuvchi o'zi tizimga kirdi (parol agent tomonidan kiritilmadi).

- Boshlang'ich qiymat (23:29:00): oylik 200 000, VIP 400 000 UZS (profil qatori "200 000 UZS / oy · VIP 400 000"; admin Trenerlar ro'yxati ham 200 000 / 400 000).
- Tiklangan qiymat: oylik 200 000 (tegilmagan), VIP 400 000; read-back 23:30:53 (Coach profil qatori) va 23:30:56 (admin Trenerlar ro'yxati).
- Vaqt: VIP 410 000 taxminan 23:29:43 da saqlangan, bo'shatilgan 23:30:27, tiklangan 400 000 taxminan 23:30:40; stage'da o'zgargan qiymat taxminan 1 daqiqa turdi.
- Qadamlar:
  1. "Obuna narxi" sahifasida VIP maydoniga 0 kiritildi, "Saqlash" bosildi.
  2. VIP 410 000 qilindi va saqlandi, sahifa yangilandi; Coach profil qatori va admin Trenerlar ro'yxati tekshirildi.
  3. VIP maydoni bo'shatildi va saqlandi; so'rov body'si sahifaga qo'yilgan kuzatuvchi bilan o'qildi.
  4. VIP 400 000 qilindi va saqlandi, sahifa yangilandi, ikkala panelda read-back qilindi.
- Kutilgan natija: 0 narx UI'da rad etiladi va so'rov ketmaydi; VIP narx saqlanadi va profil qatorida, admin ro'yxatida ko'rinadi; bo'sh maydon `vipMonthlyPrice: null` yuboradi.
- Haqiqiy natija:
  - 0 narx: "VIP narxi noldan katta bo'lishi kerak" xatosi chiqdi, so'rov ketmadi (network logda `/api/` so'rovi yo'q).
  - 410 000: `PUT /api/coach/profile` 200, toast "Narx yangilandi"; yangilangandan keyin profil qatori "200 000 UZS / oy · VIP 410 000"; admin Trenerlar ro'yxati "200 000 so'm / 410 000 so'm".
  - Bo'sh maydon: `PUT /api/coach/profile` 200, body `{"displayName":"Stage Coach","bio":"Test trainer","monthlyPrice":200000,"vipMonthlyPrice":null}`; profil qatorida VIP qismi yo'qoldi.
  - Tiklash: `PUT /api/coach/profile` 200; profil qatori "200 000 UZS / oy · VIP 400 000", admin ro'yxati "200 000 so'm / 400 000 so'm".
- Xatolar (HTTP status, `title`, `code`, so'rov body'si): backend xatosi bo'lmadi.
- Eslatmalar:
  - Spec'da VIP 400 000 qilib saqlash aytilgan, lekin Stage Coach'ning asl VIP narxi allaqachon 400 000 edi (o'zgarish bo'lmasdi). Shuning uchun saqlash va read-back 410 000 bilan o'tkazildi, 400 000 esa tiklash qadami bo'ldi.
  - Eski VIP obunachilar haqidagi qoida (VIP bo'shatilganda joriy obunachilar chatni obuna tugaguncha saqlaydi) backend tomonida, bu yerda sinalmadi; Stage Coach'da faol VIP obunachi bor yoki yo'qligi ham tekshirilmadi.

## 4. Video yuklash

Vaqtlar Toshkent vaqti (UTC+5). Muhit: `coach.stage.peaktofan.com`, `stage-coach`.

- Boshlang'ich qiymat (23:31): Stage Coach'da mashg'ulot dasturlari yo'q ("Hali dastur yo'q").
- Tiklangan qiymat: "Stage test" dasturi o'chirildi (`DELETE /api/coach/workout-programs/cf291968-8a97-4902-a9c3-6bbdace03036` 200, taxminan 23:35:40); dasturlar ro'yxati yana bo'sh.
- Vaqt: dastur taxminan 23:35:10 da yaratildi, taxminan 23:35:40 da o'chirildi (stage'da taxminan 30 soniya turdi).
- Test video: `ffmpeg` (`testsrc2` + `sine`, H.264/AAC) bilan session scratchpad'da yaratilgan, 30 soniya, 20 527 609 bayt (8 MB'lik 3 ta bo'lak). Foydalanuvchining o'z videolari ishlatilmadi.
- Qadamlar:
  1. "Dasturlar" > "Yangi dastur": nom "Stage test", maqsad "Vazn yo'qotish", "Kun qo'shish": kun nomi "Stage test kun".
  2. "Video qo'shish" orqali video tanlandi (fayl kiritish elementiga fayl sahifaning o'zi orqali berildi, pastdagi eslatmaga qarang).
  3. Yuklash va qayta ishlash network log'da kuzatildi.
  4. Yuklangach "Kunni saqlash", so'ng "Qoralama yaratish" bosildi, keyin dastur o'chirildi.
- Kutilgan natija: video bo'laklab yuklanadi, `complete` muvaffaqiyatli, video qayta ishlanib tayyor holatga o'tadi, kun video yuklangandan keyin saqlanadi.
- Haqiqiy natija:
  - Tus: `POST /api/files/uploads` 201, so'ng 3 ta `PATCH /api/files/uploads/4a9f959958334d7da547ea066ed2614d` 204 (har biri 8 MB bo'lak, oxirgisi qoldiq), so'ng `POST .../complete` 200.
  - Qayta ishlash: `GET /api/files/videos?ids=dc25a658-3849-4210-9127-7d50c475434d` har 5 soniyada, jami 11 ta so'rov; 23:33:56 da holat "Tayyorlanmoqda", 23:34:54 da "Yuklandi" (tayyor). Qayta ishlash taxminan 50-60 soniya oldi.
  - Tayyor video: `streamStatus` 2, `durationSeconds` 30, `hlsUrl` va `posterUrl` bor.
  - Yuklash paytida (40% da) workout-programs bo'yicha yozuv so'rovi ketmadi; "Kunni saqlash" tugmasi yuklash paytida ham bosiladigan, ostida "Videolar yuklanmoqda. Kunni saqlab, ishni davom ettirishingiz mumkin, lekin bu oynani yopmang" yozuvi bor. Hujjatga ko'ra (`docs/modules/coach.md`) bu navbatga qo'yilgan saqlash: kun/dastur video saqlanib bo'lgach yuboriladi. Bu navbatli saqlashning o'zi sinalmadi: kun yuklash tugagandan keyin saqlandi.
  - Dastur: `POST /api/coach/workout-programs` 200, "Qoralama" holati, kun "Tayyor" nishoni bilan.
- Qayta sinov, navbatli saqlash (2026-11-09 00:15-00:17, lokal Coach `localhost:4300`, stage API, 20.5 MB video, sahifada har tus bo'lagiga sun'iy 6 soniya kechikish qo'yilgan, bosishlar sahifa ichidan vaqtga qo'yilgan):
  - Birinchi urinishda yuklash 8 soniyada tugab bo'ldi (bosishdan oldin), shuning uchun navbatli saqlash sinalmadi; ikkinchi urinish kechikish bilan o'tdi.
  - Yuklash 00:16:09 da boshlandi; 00:16:11 da "Kunni saqlash", 00:16:14 da "Qoralama yaratish" bosildi (yuklash davomida). Ekranda "Dastur videolar yuklanib bo'lgach yaratiladi. Bu oynani yopmang." toast'i chiqdi, ro'yxat hali bo'sh, pastda yuklash paneli 40%.
  - `POST /api/files/uploads/<id>/complete` 00:16:35.701-00:16:36.370 (200), keyin darrov `POST /api/coach/workout-programs` 00:16:36.372 (200). Yaratish so'rovi `complete` tugagandan keyin ketdi, yuklash tugamaguncha ketmadi.
  - Dastur o'chirildi (`DELETE` 200), ro'yxat bo'sh. Natija: 22-hikoya (kun/dastur faqat video yuklangandan keyin saqlanadi) navbatli saqlash orqali bajariladi.
  - Qayta sinovda yana 2 ta video fayli yuklandi (biri dasturga bog'lanmadi, ikkinchisi dastur bilan o'chirildi); stage'da jami 3 ta yetim video fayli bor (backend savoli 1).
- Xatolar (HTTP status, `title`, `code`, so'rov body'si): backend xatosi bo'lmadi.
- Backend uchun savol: dastur o'chirilgandan keyin ham video fayli (`fileId` `dc25a658-3849-4210-9127-7d50c475434d`) `GET /files/videos` da 200 va `streamStatus` 2 bilan qaytmoqda. Panelda faylni o'chirish yo'q; yetim fayl stage'da qoldi (storage tozalashni backend hal qiladimi?).
- Eslatma: brauzer asbobi 10 MB'dan katta faylni to'g'ridan-to'g'ri bera olmaydi, shuning uchun fayl loopback server (`127.0.0.1`) orqali sahifaga olib kelinib, `DataTransfer` bilan kiritildi. "Video qo'shish" tugmasi bosilganda OS fayl tanlash oynasi ochilgan bo'lishi mumkin (agent uni ko'ra olmaydi); u bo'sh qoldirildi.

## 5. Push

Vaqtlar Toshkent vaqti (UTC+5). Hamma push faqat Stage Coach foydalanuvchisiga (`6ff7b6f8-5248-4c0d-a78f-9c9d7c320b55`) yuborilgan, matn "Stage push test 2026-11-08", turi "Mashg'ulot eslatmasi" (admin formasidagi standart tur).

- Boshlang'ich qiymat (23:36): brauzerda bildirishnoma ruxsati `default`, service worker yo'q, push token yo'q, Profil'da "Bildirishnomalar: O'chiq".
- Tiklangan qiymat: Coach'dan sign out qilindi (23:45:04), token backend'dan va FCM'dan o'chirildi, lokal Coach'da push o'chirildi. Brauzer ruxsati `granted` va service worker ro'yxatda qolgan (brauzer sozlamasi, backend'da emas).
- Vaqt: token 23:38:12 da ro'yxatdan o'tdi, 23:45:04 da o'chirildi.
- Qadamlar va natijalar:
  1. `GET https://coach.stage.peaktofan.com/push-config.json` 200, `application/json`: `apiKey`, `appId`, `projectId`, `messagingSenderId` to'ldirilgan, `vapidKey` yo'q (ixtiyoriy). Qiymatlar hisobotga yozilmadi. Profil'da "Bildirishnomalar" qatori ko'rindi. FCM loyiha `tofan-dev`.
  2. Foydalanuvchi Chrome'ning o'z oynasida ruxsat berdi (`Notification.permission` `granted`), token saqlandi (142 belgi), qator "Yoqilgan" bo'ldi. Bu birinchi ro'yxatdan o'tish so'rovi network asbobida ko'rinmadi (ruxsat oynasi paytida), shuning uchun push o'chirilib qayta yoqildi va so'rovlar sahifaga qo'yilgan kuzatuvchi bilan o'qildi: `POST https://fcmregistrations.googleapis.com/v1/projects/tofan-dev/registrations` 200, `PUT /api/device-tokens/me` 200, body `{"token":"<yashirilgan>","deviceName":"Tofan Coach Web","platform":3}`. O'chirishda `DELETE /api/device-tokens/me` 200.
  3. Tab ochiq (deploy qilingan Coach `v1.5`): admin "Maxsus matn" `POST /api/notifications/custom` 200 (23:39:45). Worker tab'ga `push-received` yubordi, ammo tab'da hech narsa ko'rinmadi (toast ham, tizim bildirishnomasi ham). **Kutilgan natija bajarilmadi**, sabab frontend (pastda).
  4. Tab yopiq, brauzer ochiq: `POST /api/notifications/custom` 200 (23:40:41). Worker bildirishnomani yaratdi: `registration.getNotifications()` da sarlavha va matn "Stage push test 2026-11-08", `data` `{}`, vaqti 23:40:41. Ammo foydalanuvchi macOS'da bildirishnoma ko'rmadi; agent lokal "OS path test" bildirishnomasini ham chiqardi, uni ham ko'rmadi. Demak macOS yoki Chrome bildirishnoma sozlamasi (Focus rejimi yoki System Settings > Notifications > Google Chrome) ko'rsatmayapti. **macOS bildirishnomasi tasdiqlanmadi**; push backend'dan worker'gacha yetib keldi, ko'rinishi muhit sababli tekshirilmadi.
  5. Sign out: `DELETE /api/device-tokens/me` 200 (23:45:04), `DELETE` FCM registratsiya 200, `POST /api/auth/logout` 200; lokal token va sessiya o'chdi. Token backend'dan o'chgani network'da tasdiqlandi.
- Frontend xatosi (tuzatildi): tab ochiq bo'lganda worker faqat `data`ni tab'ga yuborardi, `PushStore` esa faqat muvaffaqiyatsiz video push'ini ko'rsatardi; oddiy push yo'qolardi (2-qadamdagi 24-hikoya bajarilmadi). Tuzatish: worker `title` va `body`ni ham yuboradi, `PushStore` ularni toast qilib ko'rsatadi (video xatosi o'z xabari bilan qoladi, tizim bildirishnomasiga bosilganda matn qaytarilmaydi). Testlar: `push.store.spec.ts`, `push-message.spec.ts`, `notification.service.spec.ts`.
- Tuzatishni qayta tekshirish: deploy qilingan `v1.5` image'ida emas (u yangi release bilan chiqadi), lokal Coach (`localhost:4300`, stage API, `tofan-dev`) da, tab oldingi planda turganda: 23:51:52 da admin push'dan keyin tab ichida "Stage push test 2026-11-08" toast'i ko'rindi. Tab fonda bo'lganda worker tizim bildirishnomasini chiqaradi (23:48 yuborishda ko'rildi).
- Qayta sinov, ochiq tab (2026-11-09 00:19, lokal Coach `localhost:4300`, tab oldingi planda va fokusda): admin "Maxsus matn" 1 ta push yubordi (00:19:39.468, `POST /api/notifications/custom`). Worker tab'ga 00:19:39.982 da (0.5 soniya) `push-received` yubordi (tab `visible`, `hasFocus` true), ekranda "Stage push test 2026-11-09" toast'i ko'rindi, tizim bildirishnomasi chiqmadi. Qo'shimcha kutilmagan push kelmadi. Push keyin o'chirildi (token o'chdi).
- macOS bildirishnomasi (2-band) qayta urinish: bu sessiyada ish stoli boshqaruv vositasi (`computer-use`) yo'q, shuning uchun ekranni agent ko'ra olmaydi. Faqat o'qildi: `com.apple.ncprefs` da Chrome uchun `auth = 7` (tizim ruxsati bor), Focus holatini o'qib bo'lmadi (fayl ruxsati yo'q). 00:20:11 da `osascript` bilan bitta lokal sinov bildirishnomasi ("OS path test (osascript)") chiqarildi, foydalanuvchi javobi kutilmoqda. macOS yoki Chrome bildirishnoma sozlamalarini agent o'zgartirmaydi.
- Xatolar (HTTP status, `title`, `code`, so'rov body'si): push yuborish va token so'rovlarida backend xatosi bo'lmadi.
- Backend uchun savol: lokal tab 18:50:29 UTC (23:50:29) da yana bitta "Stage push test 2026-11-08" va 18:50:50 UTC (23:50:50) da "Rejadagi mashg'ulot / Mashg'ulot vaqti keldi" (shablon push) oldi. Admin sessiyamiz faqat 4 ta `POST /api/notifications/custom` yuborgan (23:39, 23:40, 23:48, 23:51) va shablon so'rovi yubormagan. Bu ikki push'ni kim yoki nima yuborganini bilmaymiz (qayta yuborish yoki backend'dagi rejalashtirilgan eslatma bo'lishi mumkin).

## Gate va yakuniy read-back

Vaqtlar Toshkent vaqti (UTC+5).

- Gate (`lint`, `test`, `test:coach`, `test:landing`, `build`, `build:coach`, `build:landing`): sinovdan oldingi commit `2d9a5e4` uchun 23:12 atrofida, push tuzatishi (`a4aa3df`) uchun va code-review tuzatishlari (`7cb3e67`) uchun 23:58:26 da hammasi exit 0 bilan o'tdi.
- Code-review (`main` ga nisbatan): Standards va Spec ko'rib chiqildi; tuzatildi: 4 ta testning nomi (`when`), `PushMessagingService.workerEvents` uchun spec, `docs/modules/coach.md` da "push hech qachon jim emas" iborasi, `payload.data` ikki marta o'qilishi, toast muddat konstantasi nomi. Tuzatilmadi: `formatNumber` bilan bog'liq kuzatuvlar (Duplicated Code, Middle Man, nom to'qnashuvi, ikki fraksiya argumenti) sinovdan oldingi `2d9a5e4` commit kodida, spec'dan tashqari; `.gitattributes` o'zgarishi `2d9a5e4` ichida (bir commit qoidasi bo'yicha).
- Yakuniy read-back (23:57:46, admin sahifasidan o'z tokeni bilan):
  - Tariff narxlari: Free 0, Standard 120 000, VIP 300 000 (boshlang'ich bilan bir xil).
  - Standard Tariff Imtiyozlari: 4 ta, matn va tartib boshlang'ich bilan bir xil; "Stage test" yo'q.
  - Trener Tier'lari: Standard 2 ta, VIP 3 ta, boshlang'ich bilan bir xil; "Stage test" yo'q.
  - Stage Coach: oylik 200 000, VIP 400 000 (boshlang'ich bilan bir xil).
  - Coach mashg'ulot dasturlari: "Stage test" 23:35:40 da o'chirilgan, ro'yxat bo'sh (sign out'dan keyin qayta o'qilmadi).
- Qolgan izlar: Chrome'da `coach.stage.peaktofan.com` uchun bildirishnoma ruxsati `granted` va service worker; video fayli (backend savoli); Stage Coach sessiyasi tugatildi (sign out), qayta kirish kerak.
- Muhit eslatmasi: sinov Coach stage'ga kirishni foydalanuvchi qo'lda bajardi (agent parolni kiritmadi), push sinovi uchun Chrome ruxsatini ham foydalanuvchi berdi.

## Backend uchun ochiq savollar

1. Dastur o'chirilgandan keyin video fayllari stage'da qolmoqda (jami 3 ta, biri `dc25a658-3849-4210-9127-7d50c475434d`) (`GET /files/videos` 200, `streamStatus` 2). Yetim fayllar storage'dan tozalanadimi?
2. `Tariff.PaidPriceRequired` javobida alohida `code` maydoni yo'q, kod `title` ichida keladi (`title: "Tariff.PaidPriceRequired"`). Shartnoma shunday bo'lishi kerakmi?
3. Stage Coach foydalanuvchisi 23:50:29 da qo'shimcha "Stage push test 2026-11-08" va 23:50:50 da shablon push ("Rejadagi mashg'ulot / Mashg'ulot vaqti keldi") oldi; admin sessiyamiz ularni yubormagan. Ularni kim yoki nima yubordi?
4. Maxsus matnli push'ning `data` qismi bo'sh (`{}`), faqat sarlavha va matn bor. Tizim bildirishnomasiga bosilganda ochiladigan ekran (`source`, `link`) uchun maxsus push'ga `data` qo'shish rejalashtirilganmi?
5. Stage Coach'ning VIP narxi bo'shatilganda eski VIP obunachilar chati obuna tugaguncha ishlashi backend tomonida sinalmadi (Stage Coach'da faol VIP obunachi bor-yo'qligi noma'lum).

## Sinovda tuzatilgan frontend xatolari

1. Coach tab'i ochiq va oldingi planda bo'lganda oddiy push ko'rinmasdi (5-band, 24-hikoya). Worker `title` va `body`ni tab'ga yuboradi, `PushStore` ularni toast qilib ko'rsatadi. Fayllar: `apps/coach/public/push-worker.js`, `push-message.ts`, `push-messaging.service.ts`, `push.store.ts`, `libs/core/src/feedback/notification.service.ts`. Testlar: `push-message.spec.ts`, `push.store.spec.ts`, `notification.service.spec.ts`. Hujjat: `docs/modules/coach.md`. Deploy qilingan stage image'ga yangi Coach release bilan tushadi.

## Kuzatilgan, tuzatilmagan

- Trener Tier Imtiyozlar dialogida "Limit o'zgarganda ular o'z-o'zidan yangilanmaydi" ogohlantirishi ko'rinadi, lekin Tier'larda limit yo'q. Ogohlantirish ataylab doim ko'rsatiladi (`docs/modules/benefits-dialog.md`, 50-hikoya), shuning uchun matn o'zgartirilmadi; Tier uchun alohida matn kerakmi, hal qilinishi kerak.
- Worker "ko'rinadigan" oynani `visibilityState === 'visible'` bilan aniqlaydi. Coach oynasi ko'rinib tursa-yu fokusda bo'lmasa (masalan boshqa ilova ortida), push faqat sahifa ichida toast bo'ladi, tizim bildirishnomasi chiqmaydi. Fokusni ham hisobga olish kerakmi, hal qilinishi kerak.
- `title`siz (faqat `data`li) push na ochiq, na yopiq tab'da hech qayerda ko'rsatilmaydi (`docs/modules/coach.md` da yozilgan).
