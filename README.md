# Tofan UI — admin panel

Angular 22 · Node.js 24 · Optimus UI 2 · Sakai layout · Tailwind CSS v4 · OpenAPI (ng-openapi-gen) · Vitest

## Tez start

```bash
npm install
npm start          # http://localhost:4200
```

Development rejimida `useMockApi: true` — backend'siz ishlaydi. Kirish: **admin / admin**.

Rivojlanish rejasi va modullar: [docs/roadmap.md](docs/roadmap.md).

| Buyruq                 | Vazifasi                                                   |
| ---------------------- | ---------------------------------------------------------- |
| `npm start`            | Dev server                                                 |
| `npm run build`        | Production build (`dist/tofan-ui/browser`)                 |
| `npm test`             | Unit testlar (Vitest)                                      |
| `npm run lint`         | ESLint + arxitektura qatlamlari qoidalari                  |
| `npm run format`       | Prettier                                                   |
| `npm run api:update`   | Backend Swagger'idan `openapi/tofan-api.json` ni yangilash |
| `npm run api:generate` | OpenAPI spec'dan HTTP client generatsiya qilish            |

## Arxitektura (Clean Architecture)

```
src/app/
├── domain/           # Biznes qoidalari. Toza TypeScript: Angular, RxJS, Optimus UI YO'Q
│   └── auth/
│       ├── entities/        # AuthSession, UserProfile
│       ├── value-objects/   # Credentials (validatsiya bilan)
│       ├── errors/          # InvalidCredentialsError
│       └── repositories/    # Portlar: AuthRepository, SessionRepository (abstract class)
├── application/      # Use case'lar. Faqat domain'ga bog'liq, Angular YO'Q
│   └── auth/                # LoginUseCase, LogoutUseCase, IsAuthenticatedUseCase ...
├── infrastructure/   # Adapterlar: portlarning konkret implementatsiyasi
│   ├── api/                 # ApiClient (Result konverti), xatolik mapper'i
│   │   └── generated/       # ng-openapi-gen natijasi — QO'LDA O'ZGARTIRILMAYDI
│   ├── auth/                # HttpAuthRepository, FakeAuthRepository, JWT mapper, localStorage
│   └── http/                # authTokenInterceptor
├── presentation/     # UI: sahifalar, Sakai layout, store'lar, guard'lar
│   ├── auth/                # AuthStore (signal), sessionInterceptor (401 → refresh → qayta urinish)
│   ├── layout/              # Sakai: topbar, sidebar, menyu, tema konfiguratori
│   ├── pages/               # Route'lanadigan sahifalar
│   ├── routing/             # AppPaths, guard'lar, title strategy
│   └── shared/              # Umumiy bloklar: komponentlar, toast/confirm, xato matnlari
├── di/               # Composition root: portlarni adapterlarga bog'lash
├── app.config.ts
└── app.routes.ts
```

### Bog'liqlik qoidasi

```
presentation ──> application ──> domain
infrastructure ────────────────> domain
di/, app.config.ts ──> hammasi (composition root)
```

Bu qoida `eslint.config.js` dagi `no-restricted-imports` orqali **majburiy**: masalan, `domain`
ichida `@angular/core` yoki `presentation` ichida `@infrastructure/*` import qilinsa `npm run lint`
xato beradi.

### SOLID qanday qo'llangan

- **S** — har bir klass bitta vazifa: `LoginUseCase` faqat login oqimi, `auth.mapper` faqat
  DTO → entity, `ThemeService` faqat Optimus UI tokenlarini qo'llaydi, `LayoutService` faqat layout holati.
- **O** — yangi backend/manba qo'shish uchun mavjud kod o'zgarmaydi: yangi adapter yoziladi va
  `di/` da bog'lanadi.
- **L** — `HttpAuthRepository` va `FakeAuthRepository` bir-birining o'rnini to'liq bosadi
  (`environment.useMockApi`).
- **I** — portlar kichik: `AuthRepository` (identity) va `SessionRepository` (saqlash) alohida.
- **D** — use case'lar abstraksiyaga (`AuthRepository`) bog'liq; konkret klasslar faqat `di/` da
  tanlanadi. Use case'lar constructor injection bilan yoziladi va `useFactory` orqali ro'yxatdan o'tadi,
  shuning uchun ular Angular'siz test qilinadi.

### Kelishuvlar

- Fayl nomlari Angular style guide bo'yicha: `login-page.ts`, `auth.store.ts`, `login.use-case.ts`.
- Komponentlar standalone, zoneless, OnPush (Angular 22 da default), holat — `signal`/`computed`.
- `inject()` ishlatiladi; `public` modifikatori yozilmaydi; template'ga kerakli a'zolar `protected`.
- Import alias'lar: `@domain/*`, `@application/*`, `@infrastructure/*`, `@presentation/*`, `@environments/*`.
- Stillar: faqat CSS (`src/styles/`), Tailwind utility klasslari + `@openng/optimus-ui-tailwindcss`.
- UI matnlari o'zbek tilida.

## Yangi feature qo'shish (masalan, "Foydalanuvchilar")

> Tayyor namunalar — **Mashqlar** va **Ovqatlar** kataloglari: `domain/exercises/`,
> `application/exercises/`, `infrastructure/exercises/`, `di/exercises.providers.ts`,
> `presentation/exercises/`, `presentation/pages/exercises/` (va `foods` uchun xuddi shunday).
> Yangi katalog modulini shulardan ko'chirib boshlash qulay.

1. **OpenAPI**: backend spec'ini `openapi/` ga qo'ying (yoki `ng-openapi-gen.json` dagi `input` ni
   backend URL'iga yo'naltiring) va `npm run api:generate`.
2. **Domain**: `domain/users/entities/user.ts`, `domain/users/repositories/user.repository.ts`
   (abstract class).
3. **Application**: `application/users/get-users.use-case.ts` — constructor'da `UserRepository`.
4. **Infrastructure**: `infrastructure/users/http-user.repository.ts` (generatsiya qilingan `Api`
   orqali) + `user.mapper.ts`.
5. **DI**: `di/users.providers.ts` → `provideUsers()` va uni `app.config.ts` ga qo'shing.
6. **Presentation**: `presentation/users/users.store.ts`, `presentation/pages/users/users-page.ts`,
   route'ni `app.routes.ts` ga, menyu bandini `presentation/layout/menu/app-menu.ts` ga qo'shing.
7. Use case va mapper uchun unit test yozing.

## OpenAPI

Kontrakt backend Swagger'idan olinadi va ikki bosqichda yangilanadi:

```bash
npm run api:update      # backend: http://localhost:5179/swagger/v1/swagger.json
npm run api:update -- https://api.157.90.117.20.sslip.io/swagger/v1/swagger.json   # stend
npm run api:generate    # openapi/tofan-api.json -> src/app/infrastructure/api/generated/
```

- `scripts/openapi-update.mjs` Swashbuckle chiqargan spec'ni tozalaydi: uzun CLR nomlari
  (`Tofan.Common.Domain.Result<ExerciseResponse>`) → `ResultOfExerciseResponse`, minimal API'larda
  yo'q `operationId` → `postExercisesByIdActivate`, `nullable` bo'lmagan maydonlar → `required`
  (aks holda generator hamma maydonni optional qilib qo'yadi).
- `openapi/tofan-api.json` va `src/app/infrastructure/api/generated/` git'ga commit qilinadi;
  generatsiya natijasi qo'lda tahrirlanmaydi (Prettier/ESLint uni e'tiborsiz qoldiradi).

### Javob konverti va xatoliklar

Backend har bir yozuv amalini `Result` / `Result<T>` ichiga o'raydi, xatolikni esa RFC 7807
`problem+json` ko'rinishida qaytaradi (`title` — xato kodi, `detail` — matn).

- `ApiClient` (`infrastructure/api/api-client.ts`) konvertni ochadi va chaqiruvchiga faqat `data`
  ni beradi; `PagedList` kabi javoblar o'zgarishsiz o'tadi.
- Har qanday xatolik domain xatosiga aylanadi: `ValidationError`, `NotFoundError`,
  `ConflictError`, `BusinessRuleError` (kod bilan), `AccessDeniedError`, `SessionExpiredError`,
  `ServiceUnavailableError`. Presentation shu turlarga qarab xabar ko'rsatadi.

### Sessiya

- `POST auth/login` → Keycloak tokenlari; foydalanuvchi ma'lumoti access token claim'laridan
  o'qiladi (`sub`, `preferred_username`, `name`, `realm_access.roles`) — `/auth/me` endpoint'i yo'q.
- Panelga faqat `admin` realm roli bo'lganlar kiradi: rol bo'lmasa sessiya bekor qilinadi
  (`auth/logout`), guard esa `/auth/access-denied` ga yo'naltiradi.
- `authTokenInterceptor` Bearer tokenni faqat `apiBaseUrl` ga ketayotgan so'rovlarga qo'yadi.
  401 javobida `sessionInterceptor` bir marta `auth/refresh` qiladi va so'rovni qaytadan yuboradi;
  yangilash ham muvaffaqiyatsiz bo'lsa — login sahifasi. Parallel so'rovlar bitta yangilashni
  bo'lishadi (`RenewSessionUseCase`).

## Umumiy UI bloklari

Har bir modulda qayta ishlatiladigan qismlar `presentation/shared/` da:

| Blok                              | Nima qiladi                                                                                        |
| --------------------------------- | -------------------------------------------------------------------------------------------------- |
| `components/data-table`           | Server tomonda sahifalanadigan jadval: `(pageChange)` → `PageRequest`, qatorni chaqiruvchi chizadi |
| `components/form-dialog`          | Forma uchun modal: sarlavha, Saqlash/Bekor qilish, `saving` holati                                 |
| `components/localized-text-field` | `name` / `nameUz` / `nameRu` uchligi bitta maydon sifatida                                         |
| `components/file-upload`          | Fayl tanlash + progress; natijasi — `fileId`                                                       |
| `feedback/notification.service`   | Toast: `success(...)`, `error(error)` (xato matni avtomatik tanlanadi)                             |
| `feedback/confirmation.service`   | `confirmDelete(nom)` → `Promise<boolean>`                                                          |
| `errors/error-message`            | Har qanday xatoni o'zbekcha matnga aylantiradi (backend kodlari lug'ati bilan)                     |

Jadval bilan sahifa quyidagicha yoziladi:

```html
<app-data-table
  [columns]="columns"
  [items]="page().items"
  [totalCount]="page().totalCount"
  [loading]="loading()"
  (pageChange)="load($event)"
>
  <ng-template #row let-exercise>
    <tr>
      <td>{{ exercise.name }}</td>
    </tr>
  </ng-template>
</app-data-table>
```

Sahifalash shartnomasi domenda: `PageRequest` (`first`, `rows`, `sortField`, `sortDirection`) va
`Page<T>`; ularni backend query parametrlariga `infrastructure/api/paging.mapper.ts` o'tkazadi.

### Fayl yuklash

`POST /files` multipart; progress uchun generatsiya qilingan funksiya emas, to'g'ridan-to'g'ri
`HttpClient` ishlatiladi. Hajm va kengaytma cheklovlari domenda backend qoidalari bilan bir xil
(`domain/storage/file-upload-rules.ts`): mashq videosi 200 MB (`.mp4 .m4v .mov .webm`), hujjat
20 MB (`.pdf`), rasm 10 MB (`.jpg .jpeg .png .webp`). `files/{id}/content` anonim, shuning uchun
`img` / `video` teglarida to'g'ridan-to'g'ri ishlaydi.

## Muhitlar

| Fayl                          | `apiBaseUrl` | `useMockApi` |
| ----------------------------- | ------------ | ------------ |
| `environment.development.ts`  | `/api`       | `true`       |
| `environment.ts` (production) | `/api`       | `false`      |

Dev serverda `/api` `proxy.conf.json` orqali backend'ga uzatiladi (`http://localhost:5179`,
prefiks olib tashlanadi). Shu sabab brauzerda CORS muammosi yo'q. Haqiqiy backend bilan ishlash
uchun `environment.development.ts` da `useMockApi: false` qiling; stendga ulanish uchun
`proxy.conf.json` dagi `target` ni stend manziliga o'zgartiring.

## UI kutubxonasi: Optimus UI

UI komponentlari — [Optimus UI](https://optimus.openng.org) (`@openng/optimus-ui`). Bu PrimeNG 21
ning oxirgi MIT kodidan hamjamiyat qilgan fork: API PrimeNG bilan bir xil, faqat importlar
`primeng/*` o'rniga `@openng/optimus-ui/*`. Shuning uchun PrimeNG v21 hujjatlari ham asosan mos keladi.

| Paket                            | Vazifasi                        | Litsenziya |
| -------------------------------- | ------------------------------- | ---------- |
| `@openng/optimus-ui`             | Komponentlar                    | MIT        |
| `@openng/optimus-ui-themes`      | Aura / Lara / Nora presetlari   | MIT        |
| `@openng/optimus-ui-tailwindcss` | Tailwind plugin                 | MIT        |
| `@openng/icons`                  | Ikonkalar (`pi pi-*` klasslari) | MIT        |
| Sakai (sakai-ng)                 | Layout shabloni                 | MIT        |

⚠️ **`primeng`, `@primeuix/*` va `primeicons` paketlarini loyihaga qayta qo'shmang.** PrimeNG 22+,
`@primeuix/themes@3+` va `primeicons@8+` pullik PrimeUI License ostida chiqqan va litsenziya
kalitisiz "Invalid PrimeUI License" bannerini ko'rsatadi.

Uchinchi tomon kodidan olingan qismlarning litsenziya matnlari — [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
Yangi kutubxona yoki boshqa loyihadan kod olsangiz, uning litsenziyasini tekshiring va kerak
bo'lsa shu faylga qo'shing.

## Sakai haqida

Layout [sakai-ng](https://github.com/primefaces/sakai-ng) asosida. O'zgarishlar: SCSS → toza CSS,
demo sahifalar olib tashlangan, komponentlar signal/`inject()`/yangi control flow bilan qayta
yozilgan, tema logikasi (`ThemeService`) UI'dan ajratilgan, logo `shared/components/logo` da
(Tofan logosi bilan almashtiring).
