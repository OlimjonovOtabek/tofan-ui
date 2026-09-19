# Architecture — Tofan Admin Panel

Read on demand. Rules live in CLAUDE.md; this file explains **why**.

## Why a standard feature-based structure
The panel is a UI over a few dozen backend endpoints. Clean Architecture layers (domain, application,
infrastructure, presentation), repository abstractions and use-case classes mostly forwarded calls
and tripled the number of files for every screen. The panel now uses the structure most Angular
developers already know:

- **core/** — things that exist once for the whole app: auth, the HTTP client, layout, configuration,
  toasts and confirmations.
- **features/<x>/** — one folder per screen group. Everything a screen needs sits together:
  `pages/`, `components/`, `models/`, `services/`, the store and the routes. Deleting the folder
  removes the feature.
- **shared/** — reusable, business-agnostic pieces: components, models, utils (and directives, pipes,
  validators when they appear).
- **routes/app.routes.ts** — the top-level route table; every feature is lazy loaded.

## Data flow
Page → store (signals) → feature service → `core/http/ApiClient` → backend.
DTOs and mappers keep backend shapes out of components, so a contract change touches
`services/*.dto.ts` and `*.mapper.ts`, not templates.

## Why no feature imports another feature
Features stay independent and removable. When two features need the same thing, it moves to
`shared/` or `core/`. When a feature needs data from an endpoint another screen also uses, it calls
that endpoint through its own service with only the fields it needs (`media` reads `GET /exercises`).
Sheriff (`sheriff.config.ts`) enforces the folder dependency rules on the resolved file of every import;
ESLint additionally rejects `@features/*` imports inside `core/`, `shared/` and `features/`, specs included.

## Why shared components over raw Optimus UI copies
- One place to fix behaviour for every table/dialog.
- Limits the blast radius of Optimus UI upgrades or a switch to another library.

## Decisions log
| Date | Decision | Alternatives rejected | Reason |
|---|---|---|---|
| 2026-09-16 | Signal stores instead of NgRx | NgRx Store, NgRx SignalStore | Admin screens are mostly independent; fewer moving parts |
| 2026-09-16 | Optimus UI 2 instead of PrimeNG 22 | PrimeNG 22 with a PrimeUI license key | PrimeNG 22+, `@primeuix/themes@3+` and `primeicons@8+` show "Invalid PrimeUI License" without a paid key; Optimus keeps the PrimeNG 21 API under MIT |
| 2026-09-16 | Identity boundary Angular → .NET API → Keycloak | Angular calling the Keycloak Admin API | Keycloak stays replaceable without touching the panel; admin credentials never reach the browser; the backend remains the only security boundary |
| 2026-09-16 | Planned: Keycloak login page (OIDC + PKCE) through `keycloak-angular` | Posting credentials to backend `POST /auth/login` (current) | The admin would never hand a password to the panel; Keycloak owns brute-force protection and MFA. Needs a public `tofan-admin` client in the `tofan` realm. Not implemented yet; it will live in `core/auth` |
| 2026-09-16 | User-facing text in Uzbek constants, no i18n library | `@angular/localize`, ngx-translate | One UI language today; adding a library needs approval (CLAUDE.md) |
| 2026-09-19 | Three UI languages (uz, ru, en) through an in-house `core/i18n`: typed dictionaries, `LocaleStore`, impure `t` pipe (replaces the row above) | `@angular/localize` (one build per language, no runtime switch), ngx-translate / Transloco (new dependency) | Runtime switching without a reload; missing translations fail the build; no new dependency. Details: `docs/modules/i18n.md` |
| 2026-09-17 | No OpenAPI tooling; hand-written DTOs | ng-openapi-gen client, spec snapshot | The panel uses a handful of endpoints; the staging Swagger is the reference |
| 2026-09-17 | Standard Angular structure (`core`, `features`, `shared`, `routes`) | Clean Architecture layers, repository abstractions, use-case classes, `di/` folder | It is a UI project; the layers only forwarded calls and made screens hard to follow |
| 2026-09-17 | No mock backend | Fake repositories switched by `environment.useMockApi` | Fakes had to mirror every backend rule and drifted; development runs against the real backend through `proxy.conf.json` |
| 2026-09-17 | Screen-based feature names (`exercises`, `foods`, `media`, `user-sessions`, `notifications`) | Backend module names (`workouts`, `diet`, `storage`, `users`) | Matches the menu the admin sees |
| 2026-09-17 | Sheriff as a CLI (`sheriff verify` in `npm run lint`) | `@softarc/eslint-plugin-sheriff`; ESLint `no-restricted-imports` alone | ESLint patterns miss relative imports and most of the dependency table; the Sheriff ESLint plugin only supports ESLint 8 and 9 while the project runs ESLint 10 |
| 2026-09-17 | `status-card` lives in `core/layout` | `shared/components` | It is a full-screen shell page with the theme switcher and a link to the dashboard; shared may not import `core/layout` or `core/config` |
| 2026-09-17 | File upload in `shared/components/file-upload` with its own `FileUploadService` | A `media` feature imported by forms | Several forms upload files; features may not import each other |
