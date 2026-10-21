# PR #17: admin panelning yangi ko'rinishi va API v9.1 ishlari

PR: https://github.com/jakhangir-esanov/tofan-ui/pull/17
Repo: `tofan-ui` (admin va coach panel, Angular).
Backend, mobil ilova va infratuzilmaga kod o'zgarishi yo'q.
Backendga ikkita so'rov bor, ular 5-bo'limda.

## 1. Qisqacha (hamma uchun)

PR ikki qismdan iborat.

1. **Admin panelning yangi ko'rinishi.**
   Panel `adm` loyihasidagi Apollo shablon uslubiga o'tkazildi.
   Chap tomonda to'liq balandlikdagi yumaloq sidebar, tepada breadcrumb, yangi ranglar va shrift.
2. **Ro'yxat sahifalari ekranga sig'adi.**
   Sahifaning o'zi skroll bo'lmaydi, faqat jadval qatorlari skroll bo'ladi.
   Sarlavha, filtrlar va sahifalash paneli joyida turadi.
3. **API v9.1 ga o'tish ishlari** (oldin fork `main` ida bo'lgan, endi upstream ga ketyapti).
   Trener komissiyasi, trener `slug` ustuni, imzolangan video havolalar, prod proxy.

Biznes mantiq, marshrutlar, backend so'rovlari va ruxsatlar o'zgarmagan (1 va 2-qismlar uchun).

## 2. Foydalanuvchi nimani ko'radi

| Joy | Oldin | Endi |
|---|---|---|
| Sidebar | Tepada qotirilgan topbar ostida, kichik karta | To'liq balandlik, yumaloq burchak, logo chapda, guruhlar orasida bo'sh joy |
| Topbar | Qotirilgan, sahifa nomi yo'q | Kontent ichida: menyu tugmasi, breadcrumb ("Katalog / Mashqlar katalogi"), tema, til, profil |
| Fon va kartalar | Oddiy bir xil fon | Asosiy rangga mos gradient fon, yarim shaffof yumaloq kartalar |
| Asosiy rang | Yashil (emerald) | Ko'k (blue). Konfiguratorda boshqa rang tanlash mumkin |
| Shrift | JetBrains Mono | Figtree |
| Ro'yxat sahifalari | Sahifa uzun bo'lib skroll bo'ladi | Sahifa ekranga sig'adi, jadval ichida skroll |
| Mobil (992px dan past) | Bir qatorli topbar | Ikki qatorli topbar, hamburger, sidebar mask bilan chapdan suriladi |
| Tema sozlamalari paneli | Sahifa kontenti ostida qolib, bosilmasdi | Kontent ustida chiqadi va bosiladi |

Ro'yxat sahifalari: mashqlar, ovqatlar, askarlar, hisoblar, kirishlar jurnali, bildirishnoma shablonlari, media, NFC futbolkalar, trenerlar.

## 3. API v9.1 qismi (admin panel)

| O'zgarish | Tafsilot |
|---|---|
| Trener komissiyasi | Trener qatorida yangi amal. Foiz 0 dan 100 gacha, ko'pi bilan 2 kasr. Yangi foiz faqat keyingi to'lovlarga ta'sir qiladi, oyna buni aytadi. Ro'yxatda "Komissiya" ustuni, shu bo'yicha saralash bor |
| Trener `slug` | Ro'yxatda faqat o'qiladigan "Havola" ustuni. Havola yoki nusxalash tugmasi yo'q, chunki `peaktofan.com/t/<slug>` sahifasini faqat mobil ilova ochadi |
| Mashq videosi | Tahrirlash oynasida saqlangan video imzolangan `videoUrl` bilan o'ynaydi |
| Media | Mashqqa bog'langan video ko'rish va yuklab olishda imzolangan havola bilan ochiladi |
| Prod proxy | `npm run start:prod` va `npm run start:coach:prod` (`https://api.peaktofan.com`) |

## 4. Rol bo'yicha

### PM va PO
- **Ko'rinadigan o'zgarish katta**: har bir admin foydalanuvchi yangi dizaynni birinchi ochganda ko'radi.
  Qayta o'rgatish talab qilinmaydi, menyu va sahifalar joyida.
- **Qaror kerak**: standart rang yashildan ko'kka o'zgardi, shuning uchun bizning yashil logo ko'k bo'lib ko'rinadi, rang tanlanmaguncha.
  Brend yashil qolishi kerak bo'lsa, buni bitta qatorda qaytarish mumkin (default `primary`).
- **Ataylab qilinmagan** (adm da bor, bizda yo'q):
  qidiruv oynasi, bildirishnoma qo'ng'irog'i, avatar rasmi, o'ngdagi profil paneli, yig'iladigan menyu guruhlari.
  Sabab: ularga backend yo'q va soxta matn qoidamizni buzadi.
  Kerak bo'lsa alohida vazifa sifatida rejalashtiriladi.
- **Ekranga sig'maydigan sahifalar**: jadval bo'lmagan sahifalar (droplar, askar va hisob tafsilotlari, push yuborish) oddiy skrollda qoldi.
- **Komissiya**: foizni admin o'zgartira oladi, lekin backend hozircha ro'yxatda foizni qaytarmaydi (5-bo'lim), shuning uchun ustunda "-" ko'rinadi.

### CTO
- **Hajm**: 115 fayl, taxminan +2080 / -554 qator (ikkala qism birga).
  Yangi kod asosan CSS va kichik komponentlar.
- **Arxitektura**: qoidalar buzilmadi.
  Standalone, signals, `inject()`, OnPush, yangi control flow.
  Izoh yo'q, `!important` yo'q, `any` yo'q, yangi dependency yo'q.
  Qat'iy `lint:boundaries` o'tadi.
- **Yangi umumiy qismlar**:
  `app-catalog-header` (sarlavha, jami, tugmalar), `app-breadcrumb`, `findMenuGroupLabel` (sof funksiya, testli),
  `surface-ground.ts` (rangga mos fon), `catalog.css`.
  Jadvalning skroll xulqi bitta joyda (`app-data-table`), 10 sahifa undan oladi.
- **Tema**: yuzalar (surface) asosiy rangdan hosil bo'ladi, shuning uchun rang almashsa matn va fon ohangi ham almashadi.
- **Tekshiruv**: `lint`, `test`, `test:coach`, `build`, `build:coach` o'tdi.
  Kod `upstream/main` ustida ham tekshirildi.
  Brauzerda staging API bilan 7 ta ro'yxat sahifasi, dark rejim va mobil sidebar ko'rildi.
- **Tekshirilmaganlar**:
  askarlar, hisoblar va trener obunalari sahifasi brauzerda alohida ko'rilmadi (qolganlar bilan bir xil naqsh).
  Kichik ekranda jadval ichki skrolli sinalmadi.
  Komissiyani saqlash prod ma'lumotiga tegmaslik uchun sinalmadi.
- **Texnik qarz** (ongli):
  `MediaStore.load` har sahifada mashq katalogini qayta o'qiydi (1000 tadan bitta so'rov);
  `data-table` dagi `th` ga `whitespace-nowrap` hamma jadvalga ta'sir qiladi;
  `.catalog-split` va `.catalog-aside` CSS i tayyor, lekin hozir hech joyda ishlatilmaydi.
- **Xavf**: CSS dagi `:has()` selektorlari zamonaviy brauzerlar uchun (Chrome, Safari, Firefox yangi versiyalari).
  Eski brauzerlarda jadval skrolsiz uzun bo'lib qoladi, ammo buzilmaydi.

### Mobile dev
- Mobil ilovaga o'zgarish yo'q.
- Bilib qo'ying: admin panel trener `slug` ni faqat ko'rsatadi.
  `peaktofan.com/t/<slug>` sahifasini mobil ilova ochadi, panel havola yasamaydi.
  Trener `slug` ni faqat o'zi o'zgartiradi (`PUT /coach/profile`, format `^[a-z0-9]+(-[a-z0-9]+)*$`, 3 dan 30 gacha belgi).
  Eski akkauntlarda `slug` bo'sh bo'lishi mumkin, panel "-" ko'rsatadi.
- Imzolangan video havola (`videoUrl`) mobil ilova bilan bir xil qoidada ishlaydi (kamida 6 soat yashaydi).
  Video himoyasi yoqilgach imzosiz `/files/{id}/content` `400 StoredFile.LinkInvalid` qaytaradi.

### Backend dev
Panel quyidagi kutilgan xulq bilan yozilgan.
Ikkita so'rov bor, ular 5-bo'limda.
- Komissiya: `PUT /admin/trainers/{id}/commission`, `commissionPercent` 0-100, ko'pi bilan 2 kasr.
  Panel noto'g'ri foizni o'zi tekshiradi va yubormaydi.
  Backend yomon foizga oddiy `400` qaytaradi, kodi hujjatlashtirilmagan.
  `Trainer.InvalidCommissionPercent` kodini hozircha faqat panelning o'zi chiqaradi.
- Saralash: trenerlar jadvali `commission_percent` bo'yicha saralaydi, backend bilan tasdiqlanmagan.
- Backend javoblari va so'rovlari o'zgarmagan, mavjud maydonlar buzilmaydi.

### DevOps
- **Infratuzilma o'zgarishi yo'q**: `Dockerfile`, `nginx/`, muhit o'zgaruvchilari (`API_UPSTREAM`, `NGINX_RESOLVER`), deploy qadamlari o'zgarmagan.
- Build ikkala muhit uchun ham `apiBaseUrl: '/api'`, backendni image ichidagi nginx tanlaydi.
- **Yangi dev proxy**: `proxy.prod.conf.json` (`https://api.peaktofan.com`, `ws: true`), `start:prod` va `start:coach:prod` buyruqlari.
  `angular.json` va `package.json` shu uchun o'zgargan, boshqa build sozlamasi emas.
- **Shrift**: Figtree `fonts.googleapis.com` dan yuklanadi (oldingi JetBrains Mono ham shunday edi).
  Agar tashqi shriftga CSP yoki tarmoq cheklovi bo'lsa, o'sha domenlar ruxsatda qolishi kerak (`fonts.googleapis.com`, `fonts.gstatic.com`).
- **Ogohlantirish**: `api.peaktofan.com` reliz kunigacha prod ma'lumotining nusxasi, reliz kunida qayta ko'chiriladi.
  Relizdan keyin `start:prod` haqiqiy production bo'ladi, u bilan test ma'lumot yaratmang.

## 5. Backenddan kutilayotganlar

| Ustuvorlik | So'rov | Nega kerak | Hozirgi holat panelda |
|---|---|---|---|
| P1 | `GET /files` va `GET /files/{id}` javobiga `contentUrl` (video uchun imzolangan, rasm uchun oddiy) | Video himoyasi yoqilgach hech bir mashqqa bog'lanmagan videoni ko'rib ham, yuklab ham bo'lmaydi | Eski havola bilan ochiladi, himoya yoqilgach `previewFailed` holati chiqadi |
| P2 | `GET /admin/trainers` javobida `commissionPercent` (Swagger da bor, `api.peaktofan.com` javobida hozir yo'q) | Komissiya ustuni va oynasi to'g'ri ishlashi uchun | Ustunda "-", oyna bo'sh maydon bilan ochiladi |

To'liq matn: `docs/backend-requests.md`.

## 6. Qanday sinash

1. `npm run start:staging` (yoki `npm start`, lokal backend bilan), `http://localhost:4200`.
2. Kirish uchun Keycloak da `admin` rolli akkaunt kerak.
3. Tekshirish ro'yxati:
   - Sidebar, topbar va breadcrumb to'g'ri ko'rinadimi, mobilda hamburger ishlaydimi.
   - Tema tugmasi (quyosh) va sozlamalar paneli (palitra): rang, "Overlay" menyu rejimi.
   - Har bir ro'yxat sahifasida sahifa skroll bo'lmaydi, jadval ichida skroll bo'ladi, sahifalash paneli pastda.
   - Dark rejimda ranglar va kartalar.

## 7. Bog'liq hujjatlar

- PR tavsifi: #17
- API v9.1 hisoboti: `.scratch/admin-api-v9/report.md`
- Backend so'rovlari: `docs/backend-requests.md`
- Modullar: `docs/modules/trainers.md`, `docs/modules/media.md`, `docs/modules/exercises.md`
- Deploy: `docs/deployment.md`, `docs/devops-handoff.md`
