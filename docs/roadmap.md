# Tofan admin panel — reja

> Tuzilgan: 2026-09-14. Backend holati `D:\Projects\tofan` kodi va hujjatlari
> (`CLAUDE.md`, `docs/roadmap.md`, `docs/deferred.md`) asosida tekshirilgan.
> Bajarilgan bandlar ustidan chiziladi, o'chirilmaydi.

## Hozirgi holat

- Tofan — fitnes ekotizimi: foydalanuvchilar ("soldier") mashg'ulot, ovqatlanish, faollik, vazn va
  shaxsiy moliyasini yuritadi. Backend hujjatiga ko'ra admin panel — boshqaruv, operatsiyalar va
  hisobotlar uchun.
- Backend: .NET 10 modular monolith, 14 modul, 151 endpoint. Ulardan **17 tasi admin uchun**
  (`Policies.Admin` → Keycloak `admin` realm roli). Qolganlari foydalanuvchining o'z ma'lumotlari
  (mobil ilova).
- Foydalanuvchilar ro'yxati va statistika endpoint'lari **yo'q**. `User`, `Progress`, `Shop`,
  `Payment`, `Gamification`, `AI` modullari hozircha bo'sh.
- tofan-ui: Angular 22 + Optimus UI + Sakai layout, standart feature tuzilmasi (`core`, `features`,
  `shared`). 2026-09-17 dan mock rejim va OpenAPI generatsiyasi yo'q.

---

## 0-bosqich — Poydevor: haqiqiy backend'ga ulash

Faqat tofan-ui ishi, backend'dan hech narsa kutilmaydi.

| #       | Ish                                                                                          | Nima uchun                                                              |
| ------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| ~~0.1~~ | ~~OpenAPI'ni backend Swagger'idan generatsiya qilish, namunani olib tashlash~~               | ~~Hozirgi spec to'qima~~                                                |
| ~~0.2~~ | ~~`Result<T>` javob konvertini infrastructure qatlamida ochish~~                             | ~~Backend har javobni o'raydi; `error` domain xatolariga map qilinadi~~ |
| ~~0.3~~ | ~~Haqiqiy auth: `POST auth/login`, `auth/refresh`, `auth/logout` (Keycloak tokenlari)~~      | ~~Hozir soxta login~~                                                   |
| ~~0.4~~ | ~~`admin` rolini tekshirish (`realm_access.roles`); rol yo'q bo'lsa "Ruxsat yo'q" sahifasi~~ | ~~Oddiy foydalanuvchi ham login qila oladi~~                            |
| ~~0.5~~ | ~~Token yangilash: 401 → bir marta refresh → so'rovni qayta yuborish~~                       | ~~Sessiya tushib qolmasligi uchun~~                                     |
| ~~0.6~~ | ~~Umumiy UI bloklari: jadval, forma dialogi, o'chirishni tasdiqlash, toast~~                 | ~~Har modulda qayta ishlatiladi~~                                       |
| ~~0.7~~ | ~~Ko'p tilli maydon komponenti (`Name` / `NameUz` / `NameRu`)~~                              | ~~Katalog ma'lumotlari uch tilda~~                                      |
| ~~0.8~~ | ~~Fayl yuklash (`POST /files`, progress bilan)~~                                             | ~~Mashq videolari~~                                                     |
| 0.9     | Deploy: Docker + nginx, `/api` panel nginx'i orqali (CORS kerak emas)                        | Production'ga chiqish                                                   |

`/auth/me` endpoint'i yo'q — foydalanuvchi ismi va roli token claim'laridan olinadi.

**0.1–0.5 bajarildi (2026-09-16).** Tafsilotlar — [README](../README.md#backend-bilan-aloqa). Qisqacha:

- Spec `scripts/openapi-update.mjs` orqali backend Swagger'idan olinardi. 2026-09-17 dan OpenAPI
  generatsiyasi olib tashlangan: DTO'lar qo'lda yoziladi (README → "Backend bilan aloqa").
- Dev serverda `/api` → backend proxy (`proxy.conf.json`), shuning uchun CORS kerak emas.
  Stend (`api.157.90.117.20.sslip.io`) hozir `http://localhost:4200` ga CORS bermaydi.
- Haqiqiy login/refresh/logout ulandi, `admin` roli tekshiriladi, 401 → bitta refresh → qayta
  urinish.
- Tekshirilmagan qism: haqiqiy `admin` akkaunti bilan uchdan-uchiga login (parol kerak).

**0.6-0.8 bajarildi (2026-09-16).** Umumiy bloklar `shared/components/` da, ro'yxati —
[README](../README.md#umumiy-ui-bloklari). Sahifalash shartnomasi (`PageRequest`, `Page<T>`)
`shared/models/page.ts` da. Fayl cheklovlari backend `FileUploadRules` bilan bir xil: video 200 MB (reja'dagi
220 MB — butun so'rov limiti, faylniki 200 MB).

**0.9 tayyorlandi (2026-09-17), serverga hali chiqarilmagan.** `Dockerfile` (Node 24 build →
`nginx:1.29-alpine`), `nginx/default.conf.template`: SPA fallback, `index.html` keshlanmaydi, hash'li
assetlar bir yil, `/api/*` → `tofan-api:8080` (prefiks olib tashlanadi, 220 MB gacha yuklash).
Panel va API bitta domenda ko'rinadi, shuning uchun backend'da `Cors__AllowedOrigins` o'zgartirilmaydi.
Image lokal yig'ilib, soxta API konteyneri bilan tekshirildi. Server qadamlari —
[deployment.md](deployment.md).

0-bosqichdan qolgani: **image'ni Docker Hub'ga yuklash va serverda `admin.*` domeni bilan ishga
tushirish** (server va Docker Hub'ga kirish kerak).

---

## 1-bosqich — Hozir qilsa bo'ladigan modullar

Backend endpoint'lari tayyor.

| Bo'lim                        | Imkoniyatlar                                                   | Endpoint'lar                                                                    |
| ----------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| ~~Mashqlar katalogi~~         | ~~Ro'yxat va filtr, CRUD, faollashtirish/o'chirish, video~~    | ~~`exercises` CRUD, `exercises/{id}/activate`, `/deactivate`, `files`~~         |
| ~~Ovqatlar katalogi~~         | ~~Qidirish, shtrix-kod bo'yicha topish, CRUD~~                 | ~~`diet/foods`, `diet/foods/barcode/{barcode}`~~                                |
| ~~Bildirishnomalar~~          | ~~Shablonlar CRUD, maxsus yoki shablon asosida push yuborish~~ | ~~`notification-templates`, `notifications/custom`, `notifications/templated`~~ |
| ~~Media fayllar~~             | ~~Yuklangan fayllar ro'yxati, ko'rish, o'chirish~~             | ~~`files`, `files/{id}/content`~~                                               |
| ~~Foydalanuvchi sessiyalari~~ | ~~Kim, qachon kirgan (faqat ko'rish)~~                         | ~~`user-sessions`~~                                                             |

Tartib: mashqlar → ovqatlar → bildirishnomalar → media → sessiyalar.

**Mashqlar katalogi bajarildi (2026-09-16).** `/exercises` sahifasi: server tomonda sahifalanadigan
ro'yxat, qidirish va 5 filtr (mushak guruhi, jihoz, jins, joyi, holati), qo'shish/tahrirlash
dialogi (uch tilli nom, video yuklash), faollashtirish/o'chirib qo'yish va o'chirish (tasdiqlash
bilan).

**Ovqatlar katalogi bajarildi (2026-09-16).** `/foods` sahifasi: qidirish (nom va shtrix-kod
bo'yicha), shtrix-kod bo'yicha topish — topilsa tahrirlash oynasi, topilmasa shtrix-kodi
to'ldirilgan qo'shish oynasi, CRUD, kaloriyani 100 g ga keltirib ko'rsatish. Backend ro'yxatida
faqat `Search` filtri bor (manba yoki faollik bo'yicha filtr yo'q).

**Bildirishnomalar bajarildi (2026-09-16).**

- `/notifications/templates` — shablonlar CRUD: tur × murabbiy uslubi, sarlavha va matn uch tilda.
  Backend bir tur va uslub uchun bitta faol shablonga ruxsat beradi (409 → tushunarli xabar).
- `/notifications/send` — shablon asosida yoki maxsus matn bilan push, ixtiyoriy kalit–qiymat
  ma'lumotlari bilan, yuborishdan oldin tasdiqlash. Shablon rejimida qaysi uslublar qamrab
  olingani ko'rsatiladi: backend foydalanuvchi uslubidagi shablonni, bo'lmasa professionalini
  oladi — professional yo'q bo'lsa ogohlantirish chiqadi.
- **Cheklov:** yuborish bitta `userId` ga, foydalanuvchilar ro'yxati esa yo'q (2-bosqich). ID ni
  hozircha qo'lda kiritish kerak. Ommaviy yuborish endpoint'i ham yo'q.
- Push xatolari (qurilma yo'q, foydalanuvchi o'chirgan, Firebase sozlanmagan) o'zbekcha ko'rsatiladi.

Yo'l-yo'lakay topilgan xato: jadval saralashi backend'ga yetib bormagan — backend `SortField` ni
snake_case ustun nomi sifatida kutadi va noma'lum qiymatni jimgina `id` ga almashtiradi. Tuzatildi.

**Media fayllar bajarildi (2026-09-16).** `/media` sahifasi: barcha yuklangan fayllar (eng yangisi
birinchi, nom/hajm/sana bo'yicha saralash), rasm va video ko'rish, fayl ID ni nusxalash, o'chirish.
O'chirishdan oldin mashqlar katalogi tekshiriladi: fayl biror mashqning videosi bo'lsa, tasdiqlash
oynasida shu mashqlar nomi bilan ogohlantiriladi (backend buni tekshirmaydi). Backend'da kategoriya
yoki nom bo'yicha filtr yo'q, shuning uchun sahifada ham yo'q. Yuklash bu sahifada emas — fayllar
o'zi tegishli formadan (masalan, mashq videosi) yuklanadi, aks holda hech narsaga bog'lanmagan
fayllar paydo bo'ladi.

**Kirishlar jurnali bajarildi (2026-09-16).** `/user-sessions` sahifasi (rejadagi "sessiyalar"):
foydalanuvchi ID, kirgan vaqti, token muddati va holat; ID ni nusxalash va shu foydalanuvchiga
push yuborish havolasi (`/notifications/send?userId=…` ID ni to'ldiradi). Rejadan farqlar:

- **Qurilma ma'lumoti yo'q.** `main`da trusted device oqimi olib tashlangan, sessiya yozuvida faqat
  `userId`, kirish va token tugash vaqti, bekor qilinganlik bor. Foydalanuvchi ismi ham yo'q.
- **Bu faol sessiyalar ro'yxati emas.** Yozuv login/register paytida yaratiladi; refresh yangi
  yozuv qo'shmaydi, oddiy logout yozuvni o'zgartirmaydi (faqat Keycloak'da tugatadi), faqat
  `logout-all` `isRevoked` qiladi va buni autentifikatsiyada hech narsa tekshirmaydi. Shuning uchun
  holatlar "muddati tugamagan / tugagan / hamma joydan chiqilgan" deb yozilgan, "faol" emas.
- Backend'da foydalanuvchi bo'yicha filtr yo'q.

**1-bosqich tugadi.** Qolgan ishlar backend'ga bog'liq (2-bosqich) yoki deploy (0.9).

---

## 2-bosqich — Avval backend'da endpoint kerak

Backend'ga beriladigan aniq endpoint ro'yxati: [backend-requests.md](backend-requests.md).

### Foydalanuvchi = hisob + soldier (2026-09-18 qarori)

Backend'da foydalanuvchi ikki modulda: **hisob** (Auth, Keycloak — username, email, telefon,
`enabled`, rollar, sessiyalar) va **soldier** (Soldier moduli — ism, jins, tana, maqsad, vazn;
onboarding'da paydo bo'ladi). Umumiy kalit — `userId` (Keycloak `sub`). Kelajakda ikkalasi alohida
servis bo'ladi, shuning uchun:

- Panelda ikkita alohida feature: `features/soldiers` va `features/accounts`. Har biri faqat o'z
  modulining endpoint'ini chaqiradi, bir-birini import qilmaydi.
- Birlashtirilgan javob so'ralmaydi, panel ham ma'lumotni birlashtirmaydi. Kartochkalar bir-biriga
  `userId` bo'yicha havola beradi (`/soldiers/:userId` ↔ `/accounts/:userId`).
- **Soldierlar** — asosiy ro'yxat (ism, maqsad, vazn bo'yicha qidirish). **Hisoblar** — hamma
  akkauntlar, onboarding tugatmaganlar va adminlar ham; bloklash, sessiyalar shu yerda.
- Soldier kartochkasi `404 Profile.NotFound` qaytarsa — "Onboarding tugatilmagan" holati.
- Push yuborish va kirishlar jurnalidagi `userId` soldier kartochkasiga havola bo'ladi.

### Menyu (reja)

| Guruh            | Band                              | Holat                                                      |
| ---------------- | --------------------------------- | ---------------------------------------------------------- |
| Asosiy           | Boshqaruv paneli                  | backend 2.1–2.2 kerak                                      |
| Katalog          | Mashqlar, Ovqatlar, Media fayllar | ✅                                                         |
| Katalog          | Mashg'ulot shablonlari            | backend P3 kerak                                           |
| Foydalanuvchilar | Soldierlar                        | ✅                                                         |
| Foydalanuvchilar | Hisoblar                          | ✅ (rol filtri va telefon — Keycloak sozlamasi kutilmoqda) |
| Foydalanuvchilar | Kirishlar jurnali                 | ✅ (foydalanuvchi filtri bilan)                            |
| Bildirishnomalar | Shablonlar, Push yuborish         | ✅                                                         |
| Bildirishnomalar | Yuborilganlar jurnali             | backend P2 kerak                                           |

### Tartib

| #       | Ish (panel)                                                          | Backend'dan kerak   |
| ------- | -------------------------------------------------------------------- | ------------------- |
| ~~2.1~~ | ~~Hisoblar: ro'yxat (qidiruv, faollik, rol) va kartochka~~           | ~~0.2~~             |
| ~~2.2~~ | ~~Soldierlar: ro'yxat va kartochka, vazn grafigi, "Hisob" havolasi~~ | ~~1.1–1.3~~         |
| ~~2.3~~ | ~~Hisob kartochkasida sessiyalar, bloklash, hamma joydan chiqarish~~ | ~~0.3, 1.4, 1.5~~   |
| 2.4     | Push yuborishda foydalanuvchini ro'yxatdan tanlash (ID qo'lda emas)  | 1.1                 |
| 2.5     | Dashboard                                                            | 2.1–2.2             |
| 2.6     | Yuborilganlar jurnali, ommaviy push                                  | P2 bildirishnomalar |
| 2.7     | Mashg'ulot shablonlari                                               | P3                  |

**2.1–2.3 bajarildi (2026-09-19)** backend [admin-ui-v1](../../tofan/docs/admin-ui-v1.md) asosida:
`/soldiers`, `/soldiers/:userId` (vazn grafigi SVG, kutubxonasiz), `/accounts`, `/accounts/:userId`
(rollar, bloklash, blokdan chiqarish, hamma joydan chiqarish). Hisob kartochkasidagi sessiyalar —
kirishlar jurnaliga `?userId=` havolasi. Shu bilan birga: ovqatlarda manba/holat/tasdiq filtrlari,
media o'chirishda backend `409 StoredFile.InUse` (panel tekshiruvi olib tashlandi).

Audit jurnali rejadan olib tashlandi (2026-09-18: hozir kerak emas).

---

## 3-bosqich — Kelajakdagi modullar

Backend modullari yozilgach panelga qo'shiladi: Shop (mahsulotlar, buyurtmalar), Payment (to'lovlar,
obunalar), Gamification (DP, reyting, yutuqlar), Trainer (murabbiylar va mijozlari), AI (sozlamalar).

---

## Admin panelga chiqarilmaydi

Ovqat/suv/faollik loglari, byudjet va xarajatlar, preferences, device token'lar — foydalanuvchining
shaxsiy mobil funksiyalari. Kerak bo'lsa keyinchalik faqat ko'rish rejimida, support uchun.

---

## Production'ga chiqishdan oldin (backend `deferred.md`)

Admin panel ochilgach bu bandlar yanada muhim bo'ladi:

| Band | Muammo                                                                                                                                                                                                                                                          |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.9  | Access token 90 kun yashaydi; `admin` rolli bitta token tashqariga chiqqan (2026-11-26 gacha amal qiladi)                                                                                                                                                       |
| 1.4  | Keycloak'da brute force himoyasi va parol siyosati yo'q                                                                                                                                                                                                         |
| 1.8  | Portainer va pgAdmin internetga ochiq                                                                                                                                                                                                                           |
| 1.2  | Swagger production'da ochiq                                                                                                                                                                                                                                     |
| —    | `GET /files` va `DELETE /files/{id}` faqat autentifikatsiya so'raydi, admin rolini emas, egasini ham tekshirmaydi: istalgan mobil foydalanuvchi barcha fayllarni ko'ra va o'chira oladi. `Policies.Admin` yoki egasini tekshirish kerak (2026-09-16 da topildi) |

Backend `CLAUDE.md` da frontend stack eskirgan yozilgan (Angular 20 va boshqa UI kutubxona) — uni
Angular 22 + Optimus UI ga yangilash kerak.

---

## Ochiq savollar

1. Panelni kimlar ishlatadi — faqat adminlarmi, yoki kontent menejer, murabbiy, support rollari ham
   bo'ladimi? Backend'da hozir bitta `admin` roli bor.
2. Birinchi navbatda qaysi yo'nalish kerak — katalog va kontent (1-bosqich) yoki foydalanuvchilar
   va statistika (backend ishi talab qilinadi)?
3. Login usuli: backend `auth/login` orqali (mobil kabi, tezroq) yoki Keycloak sahifasiga
   yo'naltirib (OIDC + PKCE, admin uchun xavfsizroq)?
