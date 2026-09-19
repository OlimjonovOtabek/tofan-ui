# Admin panel uchun backend'dan kerak bo'lgan endpoint'lar

> Yangilangan: 2026-09-18. Backend `origin/main` (`4a73896`) va lokal `admin-users-read` branch'i
> (`29ce68a`, hali push qilinmagan) bilan solishtirilgan.
> Muhimlik tartibida. Audit jurnali ro'yxatdan olib tashlandi (hozir kerak emas).

## Umumiy kelishuvlar

Yangi endpoint'lar mavjud kontraktga ([backend-contract.md](backend-contract.md)) va backend
`CLAUDE.md` ga mos bo'lsin:

- Hammasi `.RequireAuthorization(Policies.Admin)`.
- Boshqa foydalanuvchining ma'lumotini o'qiydigan endpoint'lar `/admin/...` prefiksi bilan, mobil
  ilovaning `me` endpoint'lari bilan aralashmasligi uchun.
- Ro'yxatlar: `IPagedListQuery<T>` + Dapper, `PagingRequest<T>` (`First`, `Rows`, `SortField`
  snake_case, `SortOrder`), javob `{ "data": [], "totalCount": 0 }`. `SortField` javob modelining
  xususiyatlaridan olinadi, shuning uchun `ORDER BY` dagi ustun nomi javob xususiyatining snake_case
  shakliga mos bo'lishi kerak (JOIN bo'lsa — ichki so'rov yoki CTE orqali).
- Bitta yozuv va buyruqlar: `Result<T>`; xatolar ProblemDetails, har birida barqaror `code`.
  Panel xabar matnini emas, `code` ni tekshiradi.
- Sanalar ISO 8601 UTC, enum'lar integer.
- Keycloak bilan ishlash faqat Auth moduli ichida, mavjud `IIdentityProviderClient` orqali. Panel
  Keycloak Admin API'ga to'g'ridan-to'g'ri murojaat qilmaydi.

---

## Foydalanuvchi: hisob (Auth) va soldier (Soldier) alohida

Backend'da "foydalanuvchi" ikki modulda, ikki xil ma'noda turibdi:

| | Hisob (identity) | Soldier |
|---|---|---|
| Modul | Auth | Soldier |
| Manba | Keycloak | `soldier.*` jadvallari (`profiles`, `body_profiles`, `goal_profiles`, `preferences`, `weight_logs`) |
| Qachon paydo bo'ladi | `POST /auth/register` | Onboarding'da (`CompleteOnboarding` / `CreateProfile`) |
| Ma'lumot | username, email, telefon, email tasdiqlangani, `enabled`, rollar, sessiyalar | ism, familiya, profil username'i, tug'ilgan sana, jins, davlat, vaqt zonasi, tana, maqsad, vazn tarixi |
| Umumiy kalit | Keycloak `sub` | `user_id` (xuddi shu `sub`) |

Kelajakda ikkalasi alohida servisga ajraladi. Shuning uchun **birlashtirilgan `/admin/users`
javobi so'ralmaydi**: Auth Soldier'ga, Soldier Auth'ga bog'lanmaydi, ular o'rtasida JOIN ham,
integration chaqiruvi ham yo'q. Backend bu qarorni 2026-09-18 da `docs/admin-panel.md` da allaqachon
yozgan.

Panelda ikkita alohida bo'lim bo'ladi. Ular faqat `userId` orqali bir-biriga havola beradi:

```text
Soldierlar ro'yxati ──(qatorga bosish)──► Soldier kartochkasi ──("Hisob" tugmasi)──► Hisob kartochkasi
   GET /admin/soldiers                      GET /admin/soldiers/{userId}              GET /admin/users/{userId}

Hisoblar ro'yxati ────(qatorga bosish)──► Hisob kartochkasi ──("Soldier profili")──► Soldier kartochkasi
   GET /admin/users                         GET /admin/users/{userId}                 404 Profile.NotFound
                                                                                     = onboarding tugamagan
```

- **Soldierlar** — asosiy ish ro'yxati: panel foydalanuvchisi odamlarni ism, maqsad, vazn bo'yicha
  qidiradi. Faqat onboarding'dan o'tganlar.
- **Hisoblar** — texnik ro'yxat: hamma Keycloak akkauntlari, onboarding'ni tugatmaganlar va adminlar
  ham. Bloklash, sessiyalar, hamma joydan chiqarish shu yerda.
- Ikkala kartochka ham `userId` (Keycloak `sub`) bo'yicha ochiladi, profil `id` si bo'yicha emas.
  Shunda havola uchun hech qanday qo'shimcha so'rov kerak emas.
- Ma'lumotni panel birlashtirmaydi: har kartochka o'z modulining ma'lumotini ko'rsatadi, qolgani
  havola orqali ochiladi.

---

## P0 — mavjud endpoint'lardagi kamchiliklar

| #   | Endpoint                           | Muammo                                                                                              | Taklif                                                                                                                                  |
| --- | ---------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1 | `GET /files`, `DELETE /files/{id}` | Faqat autentifikatsiya so'raydi: istalgan mobil foydalanuvchi barcha fayllarni ko'radi va o'chiradi | `Policies.Admin` qo'shish (yoki egasini tekshirish). **Xavfsizlik, birinchi navbatda**                                                  |
| 0.2 | `GET /admin/users`, `GET /admin/users/{id}` | Lokal `admin-users-read` branch'ida tayyor, lekin `main` va stendda yo'q                    | Push, merge, stendga deploy. `tofan-api` service account'iga `view-users`, `view-realm`. Stendda bir marta qo'lda chaqirib tekshirish |
| 0.3 | `GET /user-sessions`               | Foydalanuvchi bo'yicha filtr yo'q, shuning uchun hisob kartochkasida sessiyalarni ko'rsatib bo'lmaydi | `UserId` (Guid) query parametri. `GetUserSessionsQuery` ga `UserSessionFilter`, `GetExercisesQuery` dagi kabi                           |
| 0.4 | Barcha buyruqlar (validation)      | `errors[].code` = `NotEmptyValidator`, maydon nomi yo'q                                             | `ValidationPipelineBehavior` da `ValidationFailure.PropertyName` ni ham yuborish: `errors[].propertyName: "nameUz"` (camelCase)          |
| 0.5 | `GET /diet/foods`                  | Faqat `Search`                                                                                      | `Source`, `IsActive`, `IsVerified` filtrlari; foydalanuvchi ovqatlari (`UserId != null`) katalog ro'yxatiga chiqmasin                   |
| 0.6 | `DELETE /files/{id}`               | Fayl mashq videosi bo'lsa ham o'chiriladi; panel buni o'zi tekshiryapti                             | Ishlatilayotgan faylni o'chirishda `409 StoredFile.InUse`                                                                              |

---

## P1 — Soldierlar (Soldier moduli)

Hozir Soldier'ning barcha endpoint'lari faqat `ICurrentUser.UserId` uchun. Admin variantlari xuddi
shu SQL'ni `userId` parametri bilan ishlatadi. Domen, repository va buyruqlarga tegilmaydi — faqat
yangi query'lar (Dapper) va endpoint'lar. Papkalar: `Application/Profiles/GetSoldiers/`,
`Application/Profiles/GetSoldier/`, `Application/WeightLogs/GetSoldierWeightHistory/`,
`Presentation/Profiles/...`, teg `Soldier / Admin`.

### 1.1 `GET /admin/soldiers` — ro'yxat

Query: paging + `Search` (ism, familiya, profil username'i, `ILIKE`), `Gender`, `Goal`,
`ExperienceLevel`, `IsHomeWorkout`, `CreatedFrom`, `CreatedTo`. Standart saralash `created_on_utc desc`.

```json
{
  "data": [
    {
      "userId": "3f0c…",
      "firstName": "Ali",
      "lastName": "Valiyev",
      "userName": "ali_v",
      "gender": 1,
      "countryCode": "UZ",
      "goal": 1,
      "experienceLevel": 1,
      "currentWeightKg": 85.4,
      "targetWeightKg": 78,
      "isHomeWorkout": false,
      "createdOnUtc": "2026-08-01T10:00:00Z"
    }
  ],
  "totalCount": 1
}
```

`soldier.profiles` + `LEFT JOIN body_profiles`, `goal_profiles` (`GetMyProfileOverviewQuery` dagi
kabi). Tana yoki maqsad profili yo'q bo'lsa, tegishli maydonlar `null`.

### 1.2 `GET /admin/soldiers/{userId}` — kartochka

`GetMyProfileOverviewQuery` javobining admin varianti: `WHERE p.user_id = @UserId` (joriy
foydalanuvchi o'rniga yo'ldagi `userId`). Qo'shimcha: `trainingDays`, `isHomeWorkout`,
`createdOnUtc`, `updatedOnUtc`. Javob modeli alohida (`SoldierResponse`), `MyProfileOverviewResponse`
qayta ishlatilmaydi — mobil kontrakt o'zgarsa admin javobi buzilmasin.

Xato: `404 Profile.NotFound` — hisob bor, lekin onboarding tugamagan. Panel buni xato emas,
"Onboarding tugatilmagan" holati sifatida ko'rsatadi.

### 1.3 `GET /admin/soldiers/{userId}/weight-history`

Query: `From`, `To` (UTC). Javob `GetMyWeightHistoryQuery` bilan bir xil:
`[{ "id": "…", "weightKg": 85.4, "source": 1, "note": null, "loggedOnUtc": "…" }]`.
Kun bo'yicha filtr (`FromDate`/`ToDate`) kerak emas — admin uchun UTC oralig'i yetadi, `ITimeZoneContext`
ham kerak bo'lmaydi.

Soldier ma'lumotini **tahrirlash admin'ga kerak emas** (foydalanuvchining o'zi yuritadi).

---

## P1 — Hisoblar (Auth moduli)

`GET /admin/users` va `GET /admin/users/{id}` lokal branch'da tayyor (P0 0.2). Javobni kengaytirish
so'ralmaydi — ism va jins Soldier'dan keladi. Qo'shimcha:

### 1.4 Rollar kartochkada

`GET /admin/users/{id}` javobiga `roles: string[]` (realm rollari, `default-roles-*` va
`offline_access` siz). Adminni oddiy foydalanuvchidan ajratish va o'zini bloklashdan saqlash uchun.
`IIdentityProviderClient.GetUserRealmRolesAsync(Guid userId)`. Service account huquqi: `view-users`
yetadi.

### 1.5 Bloklash va sessiyalar

| Endpoint                            | Nima qiladi                                                                                                  | Xatolar                                                                    |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| `POST /admin/users/{id}/block`      | Keycloak `enabled = false`, keyin Keycloak sessiyalarini tugatish va `UserSession` larni `Revoke`            | `404 User.NotFound`, `409 User.AlreadyBlocked`, `400 User.CannotBlockSelf` |
| `POST /admin/users/{id}/unblock`    | `enabled = true`                                                                                             | `404 User.NotFound`, `409 User.NotBlocked`                                 |
| `POST /admin/users/{id}/logout-all` | Keycloak sessiyalarini tugatish + mavjud `IUserSessionRepository.RevokeAllByUserIdAsync`                     | `404 User.NotFound`                                                        |

- `IIdentityProviderClient` ga yangi metodlar: `SetUserEnabledAsync(Guid userId, bool enabled)`
  (Keycloak `PUT /users/{id}` faqat `enabled`), `LogoutUserSessionsAsync(Guid userId)` (Keycloak
  `POST /users/{id}/logout`). Mavjud `UpdateUserAsync` ishlatilmaydi: u username/email/telefonni ham
  qayta yozadi. Yangi abstraksiya kerak emas.
- Service account huquqi: `manage-users`.
- `CannotBlockSelf` — `ICurrentUser.UserId == id`.
- Soldier ma'lumotlariga tegilmaydi. Bloklash — faqat hisob holati.
- Body kerak emas. Sabab yozish kerak bo'lsa, u audit bilan birga keyin qo'shiladi.

**Muhim:** access token 90 kun yashaydi (backend `deferred.md` 1.9), autentifikatsiya esa
`UserSession.IsRevoked` ni ham, Keycloak `enabled` ni ham tekshirmaydi. Shuning uchun bloklangan
foydalanuvchi eski tokeni bilan API'dan foydalanaveradi. Bloklash haqiqatan ishlashi uchun access
token muddatini qisqartirish (5–15 daqiqa, refresh bilan) kerak. Bu bajarilmaguncha panel
bloklash tugmasi yonida "joriy token muddati tugaguncha amal qiladi" deb yozadi.

### 1.6 Keyinroq (hozir shart emas)

- `PUT /admin/users/{id}/roles` — kontent menejer / support rollari paydo bo'lganda.
- `DELETE /admin/users/{id}` — hisob va barcha modullardagi ma'lumotni o'chirish. Modullar
  bir-biriga bog'lanmasligi uchun integration event (`UserDeleted`) orqali, alohida kelishiladi.

---

## P2 — Dashboard statistikasi

### 2.1 `GET /admin/dashboard/summary`

Query: `From`, `To` (standart: oxirgi 30 kun), `TimeZone` (standart `Asia/Tashkent`).

```json
{
  "totalSoldiers": 1240,
  "newSoldiers": 180,
  "activeSoldiers": 610,
  "workoutsCompleted": 3920,
  "foodLogs": 15400,
  "pushSent": 2100,
  "pushFailed": 35
}
```

`activeSoldiers` ta'rifini kelishish kerak: taklif — davr ichida kamida bitta mashg'ulot, ovqat yoki
faollik logi yozgan soldier (login emas, chunki refresh yangi sessiya yozmaydi). Hisoblar soni
(Keycloak) bu yerga kirmaydi — u Auth'niki.

### 2.2 `GET /admin/dashboard/timeseries`

Query: `Metric` (`newSoldiers` | `activeSoldiers` | `workoutsCompleted` | `foodLogs`), `From`, `To`,
`Interval` (`day` | `week` | `month`), `TimeZone`. Javob:
`{ "metric": "newSoldiers", "points": [{ "date": "2026-09-01", "value": 7 }] }`.

Har modul o'z sonini o'zi beradi (public contract), agregatsiya `Progress` modulida. Modullar
bir-birining sxemasini o'qimaydi.

---

## P2 — Bildirishnomalar

| Endpoint                                   | Vazifasi                                                                                                                                                                                 |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /admin/notification-deliveries`       | Yuborilganlar jurnali. Query: paging, `UserId`, `Type`, `Status`, `From`, `To`. Qator: `id, userId, type, channel, status, title, failureReason, createdOnUtc, sentOnUtc, readOnUtc`      |
| `GET /admin/notification-deliveries/stats` | Query: `From`, `To`, `Type`. Javob: `{ "sent": 0, "failed": 0, "read": 0, "readRatePercent": 0 }`                                                                                        |
| `POST /notifications/broadcast`            | Ommaviy push. Body: `{ "templateId" \| "title"+"body", "audience": { "all": true } \| { "userIds": [] } }`. Javob darhol `{ "jobId": "…", "recipients": 1180 }`, yuborish Hangfire'da |
| `GET /notifications/broadcast/{jobId}`     | Holat: `queued / running / done`, `sent`, `failed`                                                                                                                                       |

Jurnal qatorida ism yo'q — panel `userId` dan soldier kartochkasiga havola beradi.
Broadcast uchun avval biznes qarori kerak: kimga, kuniga nechta, preferences hisobga olinadimi.

---

## P3 — Mashg'ulot shablonlari

Hozir shablonlar C# kodida (`WorkoutPlanTemplates*.cs`) — o'zgartirish uchun deploy kerak.
Avval seed migratsiya bilan bazaga ko'chirish va reja tanlash logikasini bazadan o'qishga o'tkazish,
keyin admin CRUD: `GET/POST/PUT/DELETE /admin/workout-plan-templates`, `/activate`, `/deactivate`
(ishlatilayotgan bo'lsa `409 WorkoutPlanTemplate.InUse`).

---

## Keyingi bosqich (backend modullari yozilgach)

Shop, Payment, Gamification, Trainer, AI modullari hozir bo'sh. Ular yozilayotganda har biriga
boshidanoq admin ro'yxat + detail + holatni o'zgartirish endpoint'lari (yuqoridagi kelishuvlar
bilan) qo'shilsa, panel qo'shimcha kelishuvsiz ulanadi.

## Kerak emas

- Birlashtirilgan hisob + soldier javobi — modullar ajralishi uchun (yuqorida).
- Audit jurnali — hozircha.
- Soldier ma'lumotini admin tomonidan tahrirlash.
- `GET /auth/me` — ism va rol token claim'laridan olinadi.
- Panel domeni uchun CORS — panel API'ga o'z nginx'i orqali murojaat qiladi ([deployment.md](deployment.md)).
- OpenAPI client — DTO'lar qo'lda yoziladi, Swagger'ning to'g'ri bo'lishi yetarli.

## Ochiq savollar backend jamoasiga

1. Access token muddatini qisqartirish (1.5) qachon? Usiz bloklash to'liq ishlamaydi.
2. "Faol soldier" ta'rifi (2.1).
3. Broadcast cheklovlari (P2).
4. Keycloak'da o'chirilgan, lekin `soldier.profiles` da qolgan yozuvlar bo'lishi mumkinmi? Bo'lsa,
   soldier kartochkasidagi "Hisob" havolasi `404 User.NotFound` ga olib keladi — panel buni
   "Hisob topilmadi" deb ko'rsatadi.
