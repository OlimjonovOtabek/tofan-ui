# Admin API v9.1: nima o'zgardi va nimalar chiqdi

Branch: `feat/admin-api-v9`, `main` ga `4380e7a` merge commit bilan qo'shildi va remote'ga push qilindi.
Manba: backend hand-off hujjati (API v8.9 dan v9.1 ga o'tish, `api.peaktofan.com`).
Faqat admin panel o'zgarishlari qilindi, coach'ga tegilmadi.

## Nima o'zgardi

### 1. Trener komissiyasi
Admin trener qatoridagi yangi amal orqali platforma komissiyasini o'zgartira oladi.
Foiz 0 dan 100 gacha, ko'pi bilan 2 kasr (masalan 7.5).
Oyna yangi foiz faqat keyingi to'lovlarga ta'sir qilishini ogohlantiradi.
Ro'yxatga «Komissiya» ustuni qo'shildi, u bo'yicha saralash mumkin.
Yangi xato kodi `Trainer.InvalidCommissionPercent` uz, ru va en tillarida.

### 2. Mashq videosi: imzolangan havola
Mashqni tahrirlash oynasida saqlangan video endi pleyerda o'ynaydi.
Pleyer `GET /exercises` dagi imzolangan `videoUrl` dan foydalanadi.
Yangi video yuklansa yoki video olib tashlansa, pleyer yashiriladi.
Video yuklanmasa tushunarli xabar chiqadi.
Ro'yxatda pleyer yo'q.

### 3. Media: imzolangan havola
Mashqqa bog'langan video ko'rish va yuklab olishda imzolangan `videoUrl` bilan ochiladi.
Rasm va mashqqa bog'lanmagan video eski `/files/{id}/content` havolasi bilan ochiladi.
Mashq katalogini o'qib bo'lmasa, fayllar ro'yxati baribir yuklanadi va oddiy havolalar ishlatiladi.

### 4. Trener `slug` ustuni
Trenerlar ro'yxatida faqat o'qiladigan «Havola» ustuni qo'shildi.
Havola, nusxalash tugmasi va tahrirlash yo'q: `peaktofan.com/t/<slug>` sahifasini faqat mobil ilova ochadi.
Admin yaratish va yangilash so'rovlarida `slug` yo'q.

### 5. Prod proxy
Yangi `proxy.prod.conf.json` (`https://api.peaktofan.com`, `ws: true`).
Yangi buyruqlar: `npm run start:prod` va `npm run start:coach:prod`.
`start:staging` o'zgarmadi.
Swagger manbasi CLAUDE.md, AGENTS.md, README.md, `docs/onboarding.md` va `.claude/rules/services.md` da `api.peaktofan.com` ga o'zgartirildi.

## Nima o'zgarmadi (allaqachon bor edi)

- Ovqatlar: `source` filtri, «Manba» ustuni, porsiya birligi maydonlari, `isVerified` filtri va almashtirgich.
  Tarjimalarni tekshirish mavjud formada qo'lda qilinadi.
- Obuna berish: `subscription-grant-dialog`, `soldier-field` va store dagi `grantSubscription`.

## Nimalar chiqdi (E2E va sharhdan topilganlar)

### Tuzatildi
- Komissiya ustuni `NaN%` ko'rsatardi.
  Sabab: `api.peaktofan.com` hali `GET /admin/trainers` javobida `commissionPercent` qaytarmaydi, Swagger'da esa bor.
  Endi DTO maydoni ixtiyoriy, model `null` saqlaydi va ro'yxatda «-» chiqadi.
- `trainers-list-page.ts` 201 qatorga chiqqan edi, 200 ga tushirildi.
- «-» belgisi ikki joyda takrorlangan edi, bitta `emptyCell` bo'ldi.
- `ExercisesService` da bir xil URL lambda ikki marta yozilgan edi, bitta private metod bo'ldi.
- Rasm uchun oddiy havola saqlanishini isbotlaydigan test qo'shildi.
- `.claude/rules/services.md` dagi eski staging Swagger izohi yangilandi.

### Tuzatilmadi (ongli qaror yoki keyingi ish)
- `MediaStore.load` har sahifa o'zgarishida mashq katalogini qayta o'qiydi.
  Havola har safar yangi bo'ladi, narxi 1000 tadan bitta so'rov.
- `data-table.html` da `th` ga `whitespace-nowrap` qo'shilgan, bu ikkala ilovadagi hamma jadvalga ta'sir qiladi.
- `exercise-form-dialog.spec.ts` himoyalangan signalni to'g'ridan-to'g'ri o'zgartiradi.
- `Exercise` konstruktori 13 ta pozitsion argumentga yetdi.
- Komissiya bo'yicha saralash maydoni (`commission_percent`) backend bilan tasdiqlanmagan.
- `Trainer.InvalidCommissionPercent` kodini faqat panelning o'zi chiqaradi, backend yomon foizga oddiy `400` qaytaradi.

## Backend uchun so'rovlar

### P1: `GET /files` javobida `contentUrl`
Video protection yoqilgach `/files/{id}/content` imzosiz `400 StoredFile.LinkInvalid` qaytaradi.
Hozir faqat `GET /exercises` imzolangan `videoUrl` beradi.
Hech bir mashq ishlatmagan video (masalan hali bog'lanmagan yuklama) ochilmay qoladi.
Panel shu holatda mavjud `previewFailed` holatini ko'rsatadi.
To'liq so'rov: `docs/backend-requests.md`.

### P2: `GET /admin/trainers` da `commissionPercent`
Swagger'da bor, lekin `api.peaktofan.com` javobida hozir yo'q.
Backend chiqarguncha ustun «-» ko'rsatadi, oyna esa bo'sh maydon bilan ochiladi.

## Tekshiruv natijasi

- `npm run lint`, `npm test`, `npm run test:coach`, `npm run build`, `npm run build:coach`: hammasi yashil.
- Arxitektura tekshiruvi: PASS, bloklovchi yo'q.
- Brauzerda `start:prod` bilan:
  - trenerlar ro'yxatida «Havola» ustuni va komissiya oynasi ochilishi tekshirildi;
  - mashq tahrirlash oynasida pleyer ishlashi tekshirildi;
  - media'da bog'langan video imzolangan URL bilan so'ralishi tekshirildi;
  - komissiyani saqlash tekshirilmadi, chunki server prod ma'lumot bo'ladi.

## Ogohlantirish

`api.peaktofan.com` relizdan keyin prod bo'ladi.
Relizgacha u prod ma'lumotining nusxasi, reliz kunida qayta ko'chiriladi.
Relizdan keyin `start:prod` bilan test ma'lumot yaratmang.
