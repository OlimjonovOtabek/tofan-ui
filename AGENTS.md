# AGENTS.md — Tofan Admin and Coach Panels

Tool-neutral guide for AI coding agents (Codex, Cursor, Copilot, Gemini, etc.).
Claude Code reads `CLAUDE.md`; that file is the full source of truth. Keep both in sync.

## Project
Admin and coach panels for the Tofan fitness ecosystem. Angular 22, TypeScript 6 strict, Optimus UI 2
(MIT fork of PrimeNG 21, same API; never add `primeng`), Signals. Sign-in goes through the backend,
which returns Keycloak tokens. Backend: separate .NET 10 modular monolith.

## Commands
- `npm start` — dev server; `/api` is proxied to the local backend (no mock backend)
- `npm run start:staging` — dev server; `/api` is proxied to the staging API (`proxy.staging.conf.json`)
- `npm run start:coach` / `npm run start:coach:staging` — coach dev server
- `npm run build:coach` — coach production build
- `npm run lint` — must pass (ESLint + `lint:comments`, which rejects any comment in any project file,
  + `lint:boundaries`, Sheriff checking the folder dependency rules in `sheriff.config.ts`)
- `npm test` — Vitest, must pass
- `npm run test:coach` — coach Vitest suite
- `npm run build` — must pass

## Architecture
Standard Angular feature-based structure. No Clean Architecture layers, no repository abstractions,
no use-case classes, no OpenAPI generation, no mock services.

```text
apps/admin/src/app/
  core/layout/   admin shell, menu, theme and app config
  features/<x>/  pages/, components/, models/, services/, <x>.store.ts, <x>.routes.ts
  routes/        admin app.routes.ts
apps/coach/src/app/
  core/          coach shell, profile guard and the shared coach profile service
  features/<x>/  auth, programs, content, profile, clients (same layout as admin features)
  routes/        coach app.routes.ts
libs/core/src/   shared auth, http, feedback and i18n
libs/shared/src/ reusable components, models and utilities
```

Dependency rules:
- `libs/core` and `libs/shared` never import app features
- features never import other features (relative imports inside a feature)
- components → store → service → `libs/core/http/ApiClient`; components never call a service that does HTTP
- each app may import shared libraries; apps must not import one another
- only each app's `app.config.ts` reads its environment configuration

## Identity boundary
Angular → .NET API → Keycloak. Angular must not call the Keycloak Admin API directly. Administrative
identity operations (users, roles, permissions, activation, deletion, role assignment) go through the
.NET backend; Keycloak is an infrastructure concern behind backend abstractions (`IIdentityProviderClient`).
Tokens and claims are read only in `libs/core/src/auth`. Admin requires the `admin` role; coach requires
the `trainer` role and an existing trainer card. Never expose Keycloak Admin API credentials,
service-account credentials or client secrets to Angular. The backend authorizes; hiding UI is only UX.

## UI library
Optimus UI 2 (`@openng/optimus-ui`), MIT fork of PrimeNG 21 with the same API. Settled decision:
do not migrate to PrimeNG, never add `primeng`, `@primeuix/*`, `primeicons` (PrimeNG 22+ is paid).

Before UI component, form, overlay or theme work, read `.agents/skills/optimus-ui/SKILL.md`.
Primary documentation: https://optimus.openng.org/llms/llms.txt. Read focused component pages in
their `.md` form and verify APIs/tokens against the installed package and shared wrappers.
PrimeNG v21 documentation is a fallback only after verifying the relevant Optimus API.

## Coding rules
- Standalone, OnPush (default in v22), `inject()`
- Services `@Injectable({ providedIn: 'root' })`; stores `@Injectable()` provided by the page
- `input()` / `output()` / `model()`, `@if` / `@for` / `@switch`
- Signal Forms for new forms (existing forms are still Reactive Forms)
- Optimus UI only in components, pages, `libs/shared/components` and app layouts; server-side paging for tables
- Hand-written DTOs + mappers in `apps/<app>/src/app/features/<x>/services/`; errors handled by error class or backend `code`,
  never by message text
- No `any` at all (explicit, `as any`, leaked from libraries, `$any()` in templates; ESLint type-aware
  rules fail the lint), no `@ts-ignore`, no `::ng-deep`, no comments anywhere (TS, HTML, CSS, JSON,
  dotfiles; `npm run lint` rejects them)
- SOLID, small functions (≤ 25 lines), components ≤ 200 lines
- Tests next to the file (`*.spec.ts`) for stores, mappers, guards, model rules; admin and coach have separate Nx test targets

## Agent skills

### Optimus UI

For UI components, theme tokens, responsive layouts and Signal Forms adapters, use
[optimus-ui](.agents/skills/optimus-ui/SKILL.md). Official documentation index:
https://optimus.openng.org/llms/llms.txt.

### Issue tracker

Issue va spec'lar repo ichida `.scratch/<feature>/` papkasida markdown fayl bo'lib yuritiladi. See `docs/agents/issue-tracker.md`.

### Triage labels

Standart besh yorliq: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: ildizda `CONTEXT.md` va `docs/adr/`. See `docs/agents/domain.md`.
