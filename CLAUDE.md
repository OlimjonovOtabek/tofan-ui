# CLAUDE.md — Tofan Admin Panel (Angular)

Strict, repository-aware rules for Claude Code. If a request conflicts with this file, follow this file.
If a request is ambiguous, choose the option that keeps the structure below simple and consistent.
Detailed rules live in `.claude/rules/` (loaded per file type) and `docs/` (read on demand).

## 1. Project identity

Tofan is a fitness ecosystem. This repository is **only the admin panel**: management, operations, reporting.
Backend (.NET 10, modular monolith, CQRS) lives in a separate repository.
Backend contract details: `docs/backend-contract.md`. Architecture rationale: `docs/architecture.md`.

Stack:
- Angular 22, TypeScript 6 (strict), standalone APIs only
- **UI library: Optimus UI 2** (`@openng/optimus-ui`, `@openng/optimus-ui-themes`, `@openng/icons`),
  theme via `provideOptimus` design tokens. It is the MIT fork of PrimeNG 21 with the same API.
  This is a settled decision: do not migrate to PrimeNG and never add `primeng`, `@primeuix/*` or
  `primeicons` (PrimeNG 22+ needs a paid PrimeUI license key, see `docs/architecture.md`)
- Signals first; RxJS only where streams are genuinely needed
- Keycloak tokens obtained through the backend (`POST /auth/login`, `/auth/refresh`, `/auth/logout`),
  kept in `core/auth`
- Vitest (`ng test`), ESLint (`ng lint`), Prettier

## 2. Commands

```bash
npm start             # ng serve, /api is proxied to the backend (proxy.conf.json)
npm run build         # ng build (must pass before finishing a task)
npm test              # ng test (Vitest)
npm run lint          # ng lint + lint:comments (must pass before finishing a task)
npm run lint:comments # fails on any comment in any project file
npx ng g component src/app/features/<feature>/components/<name>
```

After every task: run `lint`, `test`, `build`. Fix what you broke. Never disable a rule to make it pass.
There is no mock backend: the dev server needs a running backend.

## 3. Architecture (non-negotiable)

Standard Angular feature-based structure. **No Clean Architecture layers** (no domain/application/
infrastructure/presentation split, no repository abstractions, no use-case classes, no DI composition
folder). It is a UI project; keep it flat and readable.

```text
src/app/
  core/                    # app-wide singletons, loaded once, never feature-specific
    auth/                  # AuthStore, AuthService, session storage, guards, auth interceptors
    http/                  # ApiClient (HttpClient), API_BASE_URL, Result envelope, error mapping, paging query
    layout/                # shell, sidebar, topbar, menu, theme
    config/                # app paths, title strategy, UI providers
    feedback/              # toast, confirm, clipboard, error message text
  features/                # one folder per screen group, lazy loaded
    <feature>/
      pages/<name>-page/   # routed components
      components/<name>/   # components used only inside this feature
      models/              # models, filters, drafts, enums, labels, pure rules (+ specs)
      services/            # <feature>.service.ts (HTTP), *.dto.ts, *.mapper.ts (+ specs)
      <feature>.store.ts   # signal state for the screen
      <feature>.routes.ts  # lazy routes of the feature
  shared/                  # business-agnostic, reusable in any feature
    components/            # dumb reusable components (wrappers over Optimus UI)
    directives/ | pipes/ | validators/   # created when the first one is needed
    models/                # paging, select option, file category, error classes
    utils/                 # pure functions (enum mapping, file size, identifiers, upload rules)
  routes/
    app.routes.ts          # top-level routes, loadChildren per feature
  app.config.ts
  app.ts                   # root component (Angular 22 naming, no .component suffix)
```

Current features: `dashboard`, `auth` (login, access denied, error pages), `exercises`, `foods`,
`media`, `user-sessions`, `notifications`, `not-found`.

### 3.1 Dependency direction

| Folder | May import | Must NOT import |
|---|---|---|
| core | shared | features |
| shared | core (http, feedback) | features |
| features/<x> | core, shared, its own files (relative imports) | other features |
| routes | features (lazy `import()`), core guards | — |

- Features **never** import other features (ESLint `no-restricted-imports` on `@features/*`).
  Inside a feature use relative imports; across folders use `@core/*`, `@shared/*`, `@features/*`.
  If two features need the same code, move it to `shared/` (or `core/` if it is an app singleton).
  A feature may call a backend endpoint that "belongs" to another screen through its own service and DTO
  (example: `media` reads `GET /exercises` to find videos in use).
- Only `app.config.ts` reads `environments/`.
- Each feature must stay removable: deleting `features/<x>` must break only its route entry and menu item.

### 3.2 Where things go

| Need | Location | File name |
|---|---|---|
| Model / entity | `features/<x>/models/` | `exercise.ts` |
| Filter, draft, labels, pure rule | `features/<x>/models/` | `exercise-filter.ts`, `exercise-draft.ts`, `exercise-labels.ts` |
| Backend DTO | `features/<x>/services/` | `exercise.dto.ts` |
| DTO ↔ model mapping | `features/<x>/services/` | `exercise.mapper.ts` |
| HTTP calls | `features/<x>/services/` | `exercises.service.ts` |
| Screen state | `features/<x>/` | `exercises.store.ts` |
| Routed screen | `features/<x>/pages/<name>-page/` | `exercises-page.ts` |
| Feature-only component | `features/<x>/components/<name>/` | `exercise-form-dialog.ts` |
| Reusable component | `shared/components/<name>/` | `data-table.ts` |
| Route guard | `core/auth/` | `auth.guard.ts` |

Angular 22 file naming: no `.component` suffix (`exercise-form-dialog.ts`, class `ExerciseFormDialog`).
Stores `.store.ts`, services `.service.ts`, DTOs `.dto.ts`, mappers `.mapper.ts`, routes `.routes.ts`.

## 4. SOLID in this codebase

- **S** — one component = one screen part; one store = one screen; one service = one backend resource.
  Split at ~200 lines.
- **O** — extend via inputs, content projection, strategy maps; do not add `if (type === ...)` chains.
- **I** — small services per resource (`NotificationTemplatesService`, `PushNotificationsService`).
- **D** — components talk to stores, stores talk to services, services talk to `ApiClient`.
  Components never inject a service that does HTTP. The one exception is
  `shared/components/file-upload`, whose whole job is uploading through `FileUploadService`.

## 5. Angular 22 rules

- Standalone only. No NgModules. No `standalone: true` (it is the default).
- OnPush is the default in v22: do **not** write `changeDetection`. Never use `Eager`.
- `inject()` only. No constructor injection.
- Services: `@Injectable({ providedIn: 'root' })`. Stores: `@Injectable()`, provided by the page
  (`providers: [ExercisesStore]`).
- Signals: `input()`, `input.required()`, `output()`, `model()`, `computed()`, `linkedSignal()`.
  No `@Input`/`@Output` decorators. `effect()` only for side effects outside Angular (logging, storage).
- Templates: `@if`, `@for (...; track item.id)`, `@switch`, `@let`, `@defer`.
  No `*ngIf`, `*ngFor`, `ngClass`, `ngStyle` → use `[class.x]`, `[style.x]`.
- Forms: Signal Forms (`form()`, `[formField]`) for all new forms. Every existing form is still
  Reactive Forms (login, filters, the three form dialogs, send notification); migrate a form when
  it is reworked, not in passing.
- Routing: lazy `loadComponent` / `loadChildren`, functional guards, `withComponentInputBinding()`.
- No `any`, in any form: annotations, `as any`, `any[]`, rest parameters, `$any()` in templates, or an
  `any` leaking from a library (`JSON.parse`, untyped APIs). Type it or use `unknown` and narrow.
  ESLint enforces it with type-aware rules (`no-explicit-any`, `no-unsafe-*`, `template/no-any`).
  No non-null `!` to silence the compiler. No `subscribe()` in components unless
  unavoidable; if so, `takeUntilDestroyed()`.

## 6. UI library rules (Optimus UI)

- Optimus UI components are used in components, pages, `shared/components/` and `core/layout/`.
  Never in models, services or stores.
- Repeated patterns (data table with server paging, form dialog, localized text field, file upload)
  live once in `shared/components/`. Features use them, not raw copies.
- Server-side tables: `app-data-table` (lazy `p-table`); `pageChange` → store → service.
  No client-side paging on admin lists.
- Styling: design tokens / theme preset only. No `::ng-deep`, no `!important`, no inline hex colors.
- Toasts and confirms go through `core/feedback` (`NotificationService`, `ConfirmDialogService`),
  not `MessageService` in every component.
- Import individual components (`import { TableModule } from '@openng/optimus-ui/table'`), never barrels.
- PrimeNG v21 documentation applies to Optimus UI; only the import paths differ.

## 7. Backend integration

- Backend owns business rules. The admin panel validates for UX, never as the only guard.
- No OpenAPI client generation. DTOs are hand-written from the staging Swagger and called through
  `core/http/ApiClient` (`get`, `post`, `put`, `delete`) in `features/<x>/services/`.
  The panel uses a handful of endpoints; a generator is not worth it.
- No use-case classes and no repository abstractions. A store calls the service directly and
  applies model rules (`createExerciseDraft`, ...) itself.
- `HttpClient` only in `core/http/`, `core/auth/` and `*.service.ts` files (upload progress in
  `shared/components/file-upload/file-upload.service.ts`).
- All URLs come from the `API_BASE_URL` token. No hard-coded hosts.
- DTOs mirror backend responses exactly; models are what the UI needs. Map in `*.mapper.ts`, never in templates.
- Backend enums are integers: a DTO `enum` plus `enumMap` from `shared/utils/enum-map.ts` maps them by name.
- Failures: `ApiClient` turns ProblemDetails and failed `Result` envelopes into error classes from
  `shared/models/errors` (`ValidationError`, `NotFoundError`, `ConflictError`, `BusinessRuleError`,
  `AccessDeniedError`, `ServiceUnavailableError`) and `core/auth/SessionExpiredError`, each carrying the
  backend `code`. Code switches on the class or `code`, never on message text.
  User-facing text comes from `core/feedback/error-message.ts`.
- Paging uses `PageRequest` / `Page<T>` from `shared/models/page.ts`; `core/http/paging.mapper.ts`
  builds the query (snake_case `SortField`).
- Dates travel as ISO strings and are mapped to `Date` in mappers. Time-dependent rules take `now` as a
  parameter so they stay testable.

## 8. Auth and permissions

**Identity boundary: Angular → .NET API → Keycloak.** Angular must not call the Keycloak Admin API
directly. Administrative identity operations go through the .NET backend; Keycloak is an
infrastructure concern behind backend abstractions.

- Today the panel signs in through the backend (`/auth/login`, `/auth/refresh`, `/auth/logout`), which
  returns Keycloak tokens. A move to the Keycloak login page (OIDC + PKCE via `keycloak-angular`) is
  planned (`docs/architecture.md`); it would live entirely in `core/auth`.
- Users, roles, permissions, activation/deactivation, creation, deletion, role assignment: call the
  backend (`/admin/users`, ...) through a feature service, never `/admin/realms/{realm}/...`.
  If the backend endpoint does not exist yet, stop and say so; do not work around it from Angular.
- Never put Keycloak Admin API credentials, service-account credentials, client secrets or privileged
  realm configuration in the panel (environment files, code, docs).
- The backend is the security boundary: it validates tokens and authorizes every admin endpoint.
- Backend side (for reference when proposing endpoints): the Application layer depends on an identity
  abstraction (existing: `IIdentityProviderClient` in `Tofan.Modules.Auth.Application`), Keycloak code
  lives in Infrastructure (`KeycloakAdminClient`). Reuse it; do not propose a second abstraction.
- A direct Angular → Keycloak Admin API dependency needs a specific reason; explain the reason and the
  consequences to the user before implementing anything like it.
- Tokens and claims are read only in `core/auth` (`AuthStore`, `auth.mapper.ts`). Features use
  `AuthStore` (`currentUser()`, `displayName()`, `isAdmin()`).
- The bearer token is attached by `auth-token.interceptor.ts` only for `API_BASE_URL` requests;
  `session.interceptor.ts` refreshes once on 401.
- Access: `authGuard` lets in users with the realm role `admin` (the backend's only policy,
  `Policies.Admin`). Finer permissions get added to `core/auth` when the backend splits the policy.
- Hiding a button is UX, not security. The backend still enforces.

## 9. State

- Default: a signal store per screen in `features/<x>/<x>.store.ts` (`signal()` + `computed()` + methods).
- Components read `store.items()`, call `store.load()`. Components never mutate store internals.
- Stores are provided by the page (`providers: [ExercisesStore]`), not in root, unless truly global
  (`AuthStore`).
- No global state library unless the user explicitly asks.

## 10. Clean code

- No comments anywhere in the project: TS, JS, HTML, CSS, JSON/JSONC configs, `.gitignore`-style files.
  That includes JSDoc, `// @ts-check`, `// @ts-ignore`, `/* eslint-disable */`, `<!-- -->`.
  If code needs a comment, rename or extract instead (an intentionally ignored failure gets a named
  function such as `keepSigningOutWhenBackendIsUnreachable`, never an empty or commented `catch`).
  Enforced by the `tofan/no-comments` ESLint rule (TS, HTML, inline templates) and
  `scripts/check-no-comments.mjs` (every other file), both run by `npm run lint`. Markdown docs are exempt.
  Reasoning goes into commit messages and `docs/modules/<feature>.md`.
- Names reveal intent: `ExercisesStore`, `ExerciseFormDialog`, `toExercise`.
  Forbidden names: `Helper`, `Util`, `Manager`, `CommonService`, `DataService`, `data`, `item2`.
- Functions ≤ 25 lines, components ≤ 200 lines, templates ≤ 150 lines. Extract before exceeding.
- No magic strings/numbers: constants, enums or union types.
- No dead code, no commented-out code, no `console.log` left behind.
- `readonly` everywhere possible; `protected` for template-only members; `private` for the rest.
- Early returns over nested ifs. No clever one-liners.

## 11. Testing

- Every store, mapper, guard and pure model rule gets a unit test (Vitest).
- Components: test inputs → rendered output and outputs emitted.
- Store tests mock the feature service (`{ provide: ExercisesService, useValue: {...} }`),
  never `HttpClient`.
- Test file sits next to the file: `exercise.mapper.spec.ts`.
- Test names: `should <result> when <condition>`.

## 12. How to work on a request

Before writing code, decide:
1. Which feature owns this screen? New screen group → new `features/<x>`.
2. Read or write? Which backend endpoint and DTO?
3. Which folder owns each part (table in 3.2)?
4. Does `shared/` or `core/` already have it? Reuse before creating.
5. Does the backend protect it (admin policy)?
6. Which tests prove it?

Then:
- For a new feature → use skill `new-feature`.
- For a list + create/edit screen → use skill `crud-page`.
- After a large change → delegate to subagent `architecture-reviewer`.
- If a business rule is unclear, ask. If only the structure is unclear, follow this file and the
  most complete existing feature (reference feature: `features/exercises`).

## 13. Forbidden

- Clean Architecture layer folders (`domain/`, `application/`, `infrastructure/`, `presentation/`,
  `data-access/`), repository abstractions, use-case classes, DI composition folders
- OpenAPI code generators (`ng-openapi-gen`, `openapi-generator`, ...) and generated clients
- Mock backends or fake services; the panel talks to the real backend
- `HttpClient` outside `core/http/`, `core/auth/` and `*.service.ts`
- Business logic inside components or templates
- Importing one feature from another feature
- Calling the Keycloak Admin API (`/admin/realms/...`) or holding Keycloak secrets in the panel
- Migrating from Optimus UI to PrimeNG, or adding `primeng`, `@primeuix/*`, `primeicons`
- NgModules, constructor injection, `@Input`/`@Output`, `*ngIf`/`*ngFor`
- `any` of any kind (explicit, cast, leaked from a library, `$any()`), `as unknown as`, `@ts-ignore`, `eslint-disable`
- `::ng-deep`, `!important`, inline colors
- Reading tokens/claims outside `core/auth`
- Hard-coded API URLs, error messages matched by text
- New dependencies without asking the user first
- Comments of any kind in any project file (see 10); `npm run lint` fails on them
- "Quick" shortcuts that break any rule above. Speed is allowed; structural shortcuts are not.

## 14. Definition of done

- [ ] Right feature, right folder, right file name
- [ ] Dependency table (3.1) respected, no cross-feature imports
- [ ] Signals, OnPush default, `inject()`, new control flow
- [ ] Optimus UI only in components/pages/shared/layout, via shared components where they exist
- [ ] DTO → mapper → model, errors by class or `code`
- [ ] Tests added; `lint`, `test`, `build` pass
- [ ] `docs/modules/<feature>.md` updated if behaviour or structure changed
