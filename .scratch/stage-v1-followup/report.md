# Stage v1.1: frontend hisoboti backend uchun

Sana: 2026-11-08.
Repo: `tofan-ui`.
Branch'lar:
- `feat/stage-v1-followup`;
- `feat/admin-payment-orders`.

Ikkalasi hali `main` ga qo'shilmagan va push qilinmagan.
Asos: `PR #22 backend javoblari.md`, `tariffs-v1.md`, `admin-ui-platform-fee-v1.1.md` va stage Firebase sozlamasi.

## Qisqa xulosa

Backend javoblari bo'yicha frontend'da qolgan hamma ish qilindi.
Hammasi `api.stage.peaktofan.com` bilan haqiqiy brauzerda sinaldi.
Yetti gate o'tadi: lint, test, test:coach, test:landing, build, build:coach, build:landing.
Prod panellarga hech narsa chiqmagan.

Backend'dan kerak bo'ladigan narsalar:
- 2 ta amal (deploy va env), "Sizdan kerak" bo'limida;
- javoblar, "Savollar" bo'limida.

## Sizdan kerak

### 1. Stage coach uchun Firebase env (merge'dan keyin)

Coach panel Firebase Web app sozlamasini endi build ichidan emas, konteyner env'idan oladi.
Konteyner ishga tushganda `/push-config.json` faylini yozadi.
Shu sabab bitta image stage'da ham, prod'da ham ishlaydi.

Stage `tofan-coach` service'iga quyidagi env'larni qo'ying:

| O'zgaruvchi                    | Stage qiymati (`tofan-dev`)                 |
| ------------------------------ | ------------------------------------------- |
| `FIREBASE_PUBLIC_API_KEY`      | `AIzaSyCyIpmufwpWNl-LkvmA95TOogxt8eUX7GE`   |
| `FIREBASE_APP_ID`              | `1:507735387316:web:e7c45f2064a01e6ff27be1` |
| `FIREBASE_PROJECT_ID`          | `tofan-dev`                                 |
| `FIREBASE_MESSAGING_SENDER_ID` | `507735387316`                              |
| `FIREBASE_PUBLIC_VAPID_KEY`    | bo'sh qoldiring                             |

- Prod'da hech narsa qo'yish shart emas: image'dagi standart qiymatlar prod loyihasiniki (`tofan-68065`).
- Bu qiymatlar ochiq identifikatorlar, maxfiy emas.
- Service account kaliti (`firebase-adminsdk-*.json`) panelga ham, image'ga ham kirmaydi.
- `FIREBASE_PROJECT_ID` bo'sh bo'lsa, push o'chadi va panelda push sozlamasi ko'rinmaydi.
- Qiymat yetishmasa yoki noto'g'ri belgi bo'lsa, konteyner aniq xabar bilan to'xtaydi.

Tekshirish: `curl https://coach.stage.peaktofan.com/push-config.json` `tofan-dev` qiymatlarini qaytarishi kerak.
Batafsil: `docs/deployment.md`.

### 2. Stage'ga yangi coach tag deploy

Hozir stage coach bundle'ida prod loyiha (`tofan-68065`) turibdi.
Shu sababli stage backend (`tofan-dev`) yuborgan push brauzerga yetib bormaydi.
Yangi image env bilan chiqqach, coach.stage'da push'ni boshidan oxirigacha yana sinaymiz.

Lokal sinovda butun zanjir ishladi: lokal coach, stage API va `tofan-dev` bilan.
- Token yaratildi va backend'da ro'yxatdan o'tdi.
- Ochiq tab'ga ham, yopiq tab'ga ham FCM test push keldi.
- Admin'dan yuborilgan push stage backend orqali keldi.

Sinovdan keyin token backend'dan va FCM'dan o'chirildi.
"Stage Coach" hisobida bitta "Stage push test" bildirishnomasi qoldi.

## Admin panel: nima o'zgardi

### Tofan tariflari

- Kartada bitta narx qatori qoldi ("O'quvchi to'laydi"), yonida "Platform fee qo'shilmaydi" izohi.
  Sabab: 2026-11-05 qarori, tarifga Platform fee qo'shilmaydi.
- Video limiti `0` bo'lsa "videolar yopiq" deb yoziladi.
  Formada video limiti haqida izoh bor.

### Platform fee

- Formada namuna hisob bor: 200 000 so'mlik trener obunasi uchun komissiya, soliq, provayder va jami.
  Formula sizniki: avval soliq = (narx + komissiya) × soliq%, keyin provayder = (narx + komissiya + soliq) × provayder%.
  Har qadam half-up yaxlitlanadi.
- Matnlarda fee faqat trener obunasiga qo'shilishi aytilgan.

### To'lov buyurtmalari (yangi sahifa, "Narxlar" menyusida)

- Ro'yxat ustunlari:
  - sana;
  - foydalanuvchi ID (Soldier sahifasiga havola);
  - nima uchun (trener obunasi va darajasi, yoki tarif) va reference ID;
  - narx, komissiya, soliq (foizi bilan), provayder (foizi bilan), jami;
  - holat (to'langan sana va provayder, yoki qaytarilgan sana bilan).
- Filtrlar: holat, `UserId`, `ReferenceId`.
  Saralash serverda, eng yangilari tepada.
  Backend: `GET /admin/payment-orders`.
- **"Buyurtma ochish" oynasi:**
  - trener `GET /admin/trainers` ro'yxatidan tanlanadi, ID qo'lda yozilmaydi;
  - foydalanuvchi Soldier qidiruvidan tanlanadi;
  - narx butun so'mda kiritiladi, trenerning Standard narxini bir bosishda qo'yish mumkin.

  Backend: `POST /admin/payment-orders`.
- Endpoint'da tavsif yo'q edi, shuning uchun uning ishlashi stage'da sinab aniqlandi:
  - buyurtma `Pending` holatida ochiladi;
  - `Tariff` validatsiya xatosi bilan rad etiladi;
  - `price` asosiy narx, ustiga joriy Platform fee qo'shiladi (200 000 + 50 000 + 0 + 5 000 = 255 000);
  - `tier` doim Standard;
  - buyurtmani faqat egasi ko'ra oladi va to'lay oladi: admin uchun `GET /payment-orders/{id}` va checkout havolalari `PaymentOrder.NotFound` qaytaradi;
  - stage'da Click va Payme hali sozlanmagan (`Click.NotConfigured`, `Payme.NotConfigured`).

## Reliz kuni

`docs/release-day.md` da runbook bor.
Backend prod'ga chiqqanda yangi mobil versiya hali chiqmagan bo'lishi mumkin.
Unda hamma foydalanuvchi Free'ga tushadi, eski ilovada esa yopiq kontent belgisi ham, tarif ekrani ham yo'q.
Shu holatda admin Free tarifida "Hammasi ochiq" (video) va "Hamma ovqat ochiq" toggle'larini vaqtincha yoqadi.
Yangi mobil versiya chiqqan kuni asl qiymatlar tiklanadi: 3 ta video, faqat nonushta.
Backend tomonda o'zgarish kerak emas, faqat vaqtini birga kelishib olamiz.

## Savollar va so'rovlar

### To'lov buyurtmalari

1. **Ism va nom:** ro'yxatda faqat `userId` va `referenceId` keladi.
   Har qatorga `userName` (ism va familiya, bo'lmasa username) va `referenceName` (trener nomi yoki tarif turi) qo'shsangiz bo'ladimi?
   Panel har qator uchun alohida so'rov yubormaydi.
2. **Maqsad:** `POST /admin/payment-orders` nima uchun kerak (chegirmali narx, naqd to'lov, Click yoki Payme sandbox testi)?
   Foydalanuvchi bu buyurtmani qanday topib to'laydi?
   Ilovada buyurtmalar ro'yxati yo'q, admin esa boshqa foydalanuvchi buyurtmasining havolasini ololmaydi.
3. **Tekshiruv:** `referenceId` tekshirilmaydi, mavjud bo'lmagan trener ID'si bilan ham buyurtma ochildi.
   Trener topilmasa `404 Trainer.NotFound` qaytarilsin, `userId` ham tekshirilsin.
4. **Kasr narx:** `price` kasrni qabul qiladi (1 000.5 saqlandi).
   Butun son talab qilinsin.
5. **VIP:** buyurtma doim Standard.
   VIP uchun buyurtma kerak bo'lsa, body'ga `tier` qo'shilsin.
6. **Sinov buyurtmalari:** bekor qilish yoki o'chirish endpoint'i yo'q.
   Stage'da endpoint'ni sinashdan 3 ta keraksiz `Pending` buyurtma qoldi, iltimos o'chirib yuboring:
   - `f8bf7e46-e218-4d18-b4d8-7a68bb5024a8` (Probe User, narx 1 000.5);
   - `d3f29105-6662-4995-9af1-a31c9804e285` (Probe User, mavjud bo'lmagan trener);
   - `9f940a86-9706-48be-b571-bf70ba14f277` (`stage-admin`, narx 1 000).

   Otabek Olimjonov hisobidagi buyurtma (Stage Coach, 255 000) ataylab qoldirilgan, uni ilovadan tekshiramiz.

### Stage'dagi tarif buyurtmalari

7. 3 ta Standard tarif buyurtmasida (2026-11-04 va 2026-11-05) komissiya 50 000 va provayder 3 400 turibdi, jami 173 400.
   Ular 2026-11-05 qaroridan oldin ochilganmi?
   Yangi tarif buyurtmasi aynan `monthlyPrice` bilan ochilishini tasdiqlang.
8. Tarif buyurtmalarida `tier: 1` keladi.
   Tarif uchun `tier` `null` bo'lishi kerakmi?
   Panel hozircha tarif qatorida `tier` ni e'tiborsiz qoldiradi.

## Hali sinalmagan (stage'da keyingi qadam)

- Standard va VIP narxini saqlash, `PaidPriceRequired` xatosi.
- Benefit qo'shish va o'chirish.
- Coach'da VIP narx.
- Video yuklash.
- coach.stage'da push (yangi tag deploy qilingach).
