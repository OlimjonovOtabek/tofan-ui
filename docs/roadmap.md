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
- tofan-ui: Angular 22 + Optimus UI + Sakai layout, Clean Architecture. Login hozircha soxta
  (`useMockApi`), OpenAPI spec — namuna.

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
| 0.9     | Deploy: Docker + nginx; backend stack'iga `Cors__AllowedOrigins__0` = panel domeni           | Production'ga chiqish                                                   |

`/auth/me` endpoint'i yo'q — foydalanuvchi ismi va roli token claim'laridan olinadi.

**0.1–0.5 bajarildi (2026-09-16).** Tafsilotlar — [README](../README.md#openapi). Qisqacha:

- Spec `scripts/openapi-update.mjs` orqali backend Swagger'idan olinadi (151 endpoint, 213 schema);
  `npm run api:update` + `npm run api:generate`.
- Dev serverda `/api` → backend proxy (`proxy.conf.json`), shuning uchun CORS kerak emas.
  Stend (`api.157.90.117.20.sslip.io`) hozir `http://localhost:4200` ga CORS bermaydi.
- Haqiqiy login/refresh/logout ulandi, `admin` roli tekshiriladi, 401 → bitta refresh → qayta
  urinish. `useMockApi: true` bo'lgani uchun standart holatda hamon soxta login ishlaydi.
- Tekshirilmagan qism: haqiqiy `admin` akkaunti bilan uchdan-uchiga login (parol kerak).

**0.6-0.8 bajarildi (2026-09-16).** Umumiy bloklar `presentation/shared/` da, ro'yxati —
[README](../README.md#umumiy-ui-bloklari). Sahifalash shartnomasi (`PageRequest`, `Page<T>`)
domenda. Fayl cheklovlari backend `FileUploadRules` bilan bir xil: video 200 MB (reja'dagi
220 MB — butun so'rov limiti, faylniki 200 MB).

0-bosqichdan qolgani: **0.9 — deploy (Docker + nginx, backend'da `Cors__AllowedOrigins`)**.

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
bilan). Mock rejimda uchta namuna mashq bilan to'liq ishlaydi (`FakeExerciseRepository`), shuning
uchun sahifani backend'siz ham sinash mumkin.

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

| Bo'lim                                                                | Backend'da nima qilinishi kerak                                                                           |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Foydalanuvchilar: ro'yxat, profil, vazn/maqsad tarixi, bloklash       | Soldier endpoint'lari faqat `me` uchun, `User` moduli bo'sh. Admin list/detail + Keycloak orqali bloklash |
| Dashboard: ro'yxatdan o'tganlar, faol foydalanuvchilar, mashg'ulotlar | Analitika query'lari (`Progress` moduli bo'sh)                                                            |
| Mashg'ulot shablonlari                                                | Shablonlar C# kodida (`WorkoutPlanTemplates*.cs`) — bazaga ko'chirish va admin CRUD                       |
| Bildirishnoma statistikasi (yuborildi / o'qildi)                      | `notification-deliveries` hozir faqat foydalanuvchining o'zi uchun                                        |
| Admin harakatlari jurnali (audit log)                                 | Yangi                                                                                                     |

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

Backend `CLAUDE.md` da frontend hali "Angular 20 + PrimeNG" deb yozilgan — Angular 22 + Optimus UI
ga yangilash kerak.

---

## Ochiq savollar

1. Panelni kimlar ishlatadi — faqat adminlarmi, yoki kontent menejer, murabbiy, support rollari ham
   bo'ladimi? Backend'da hozir bitta `admin` roli bor.
2. Birinchi navbatda qaysi yo'nalish kerak — katalog va kontent (1-bosqich) yoki foydalanuvchilar
   va statistika (backend ishi talab qilinadi)?
3. Login usuli: backend `auth/login` orqali (mobil kabi, tezroq) yoki Keycloak sahifasiga
   yo'naltirib (OIDC + PKCE, admin uchun xavfsizroq)?
