# Tofan UI — admin panel

Angular 21 · Node.js 24 · PrimeNG 21 · Sakai layout · Tailwind CSS v4 · OpenAPI (ng-openapi-gen) · Vitest

## Tez start

```bash
npm install
npm start          # http://localhost:4200
```

Development rejimida `useMockApi: true` — backend'siz ishlaydi. Kirish: **admin / admin**.

| Buyruq                 | Vazifasi                                        |
| ---------------------- | ----------------------------------------------- |
| `npm start`            | Dev server                                      |
| `npm run build`        | Production build (`dist/tofan-ui/browser`)      |
| `npm test`             | Unit testlar (Vitest)                           |
| `npm run lint`         | ESLint + arxitektura qatlamlari qoidalari       |
| `npm run format`       | Prettier                                        |
| `npm run api:generate` | OpenAPI spec'dan HTTP client generatsiya qilish |

## Arxitektura (Clean Architecture)

```
src/app/
├── domain/           # Biznes qoidalari. Toza TypeScript: Angular, RxJS, PrimeNG YO'Q
│   └── auth/
│       ├── entities/        # AuthSession, UserProfile
│       ├── value-objects/   # Credentials (validatsiya bilan)
│       ├── errors/          # InvalidCredentialsError
│       └── repositories/    # Portlar: AuthRepository, SessionRepository (abstract class)
├── application/      # Use case'lar. Faqat domain'ga bog'liq, Angular YO'Q
│   └── auth/                # LoginUseCase, LogoutUseCase, IsAuthenticatedUseCase ...
├── infrastructure/   # Adapterlar: portlarning konkret implementatsiyasi
│   ├── api/generated/       # ng-openapi-gen natijasi — QO'LDA O'ZGARTIRILMAYDI
│   ├── auth/                # HttpAuthRepository, FakeAuthRepository, mapper, localStorage
│   └── http/                # authTokenInterceptor
├── presentation/     # UI: sahifalar, Sakai layout, store'lar, guard'lar
│   ├── auth/                # AuthStore (signal), unauthorizedInterceptor
│   ├── layout/              # Sakai: topbar, sidebar, menyu, tema konfiguratori
│   ├── pages/               # Route'lanadigan sahifalar
│   ├── routing/             # AppPaths, guard'lar, title strategy
│   └── shared/components/   # Qayta ishlatiladigan komponentlar
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
  DTO → entity, `ThemeService` faqat PrimeNG tokenlarini qo'llaydi, `LayoutService` faqat layout holati.
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
- Komponentlar standalone, zoneless, holat — `signal`/`computed`.
- Har bir komponentda `changeDetection: ChangeDetectionStrategy.OnPush` majburiy (Angular 21 da
  default emas). ESLint tekshiradi, `ng generate component` esa avtomatik qo'yadi.
- `inject()` ishlatiladi; `public` modifikatori yozilmaydi; template'ga kerakli a'zolar `protected`.
- Import alias'lar: `@domain/*`, `@application/*`, `@infrastructure/*`, `@presentation/*`, `@environments/*`.
- Stillar: faqat CSS (`src/styles/`), Tailwind utility klasslari + `tailwindcss-primeui`.
- UI matnlari o'zbek tilida.

## Yangi feature qo'shish (masalan, "Foydalanuvchilar")

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

- Konfiguratsiya: `ng-openapi-gen.json`. Natija: `src/app/infrastructure/api/generated/`
  (git'ga commit qilinadi, Prettier/ESLint uni e'tiborsiz qoldiradi).
- `openapi/tofan-api.yaml` — hozircha **namuna** (faqat `/auth/login`, `/auth/me`). Haqiqiy
  backend kontrakti bilan almashtiring.
- Base URL `src/environments/environment*.ts` dagi `apiBaseUrl` dan olinadi.
- `authTokenInterceptor` Bearer tokenni faqat `apiBaseUrl` ga ketayotgan so'rovlarga qo'shadi;
  401 javobida foydalanuvchi avtomatik login sahifasiga qaytariladi.

## Muhitlar

| Fayl                          | `apiBaseUrl`                | `useMockApi` |
| ----------------------------- | --------------------------- | ------------ |
| `environment.development.ts`  | `http://localhost:8080/api` | `true`       |
| `environment.ts` (production) | `/api`                      | `false`      |

## Litsenziyalar va versiyalar

Loyiha ataylab **Angular 21 + PrimeNG 21** da turibdi, chunki UI stack'i to'liq **MIT** (bepul):

| Paket              | Versiya   | Litsenziya |
| ------------------ | --------- | ---------- |
| `primeng`          | `21.1.10` | MIT        |
| `@primeuix/themes` | `2.0.3`   | MIT        |
| `primeicons`       | `7.0.0`   | MIT        |
| Sakai (sakai-ng)   | —         | MIT        |

⚠️ **Bu paketlarni yangilamang:** `primeng@22+`, `@primeuix/themes@3+` va `primeicons@8+`
PrimeUI License ostida chiqqan, ular litsenziya kalitini talab qiladi va kalit bo'lmasa
"Invalid PrimeUI License" banneri chiqadi. Shu sabab `package.json` da ular aniq versiyaga
qotirilgan. Angular 22 ga o'tish ham PrimeNG 22 ni talab qiladi.

## Sakai haqida

Layout [sakai-ng](https://github.com/primefaces/sakai-ng) asosida. O'zgarishlar: SCSS → toza CSS,
demo sahifalar olib tashlangan, komponentlar signal/`inject()`/yangi control flow bilan qayta
yozilgan, tema logikasi (`ThemeService`) UI'dan ajratilgan, logo `shared/components/logo` da
(Tofan logosi bilan almashtiring).
