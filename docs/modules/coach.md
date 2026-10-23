# Coach app

## Purpose

The coach app (`apps/coach`) is the web version of the Flutter coach app `tofan_trainer`.
The mobile `lib/` folder is the specification: screens, flows, texts (`lib/l10n/*.arb`), design tokens and components.
Coach access requires the `trainer` role.
The backend needs a trainer card before profile data is available; without one the guard sends the coach to `/onboarding`.

## Navigation

Five tabs, in this order: Dashboard (`/dashboard`), Programs (`/programs`), Clients (`/clients`), Chat (`/chat`), Profile (`/profile`).
Desktop shows a left sidebar.
Phone width (below 992px) shows the floating bottom tab bar.
A route marked with `data: { pushed: true }` hides the tab bar, like a pushed screen on mobile.
The Content tab (own exercises and foods) is hidden, as on mobile.

## Screens

| Area | Routes | Backend |
|---|---|---|
| Sign-in | `/auth/login` | `/auth/login` |
| Dashboard | `/dashboard` | `GET /coach/dashboard` |
| Programs | `/programs?kind=workout\|meal` | `/coach/workout-programs`, `/coach/meal-programs` |
| Workout program | `/programs/workout/new`, `:id`, `:id/edit` | create, read, update, delete, publish, `days`, `days/order` |
| Meal program | `/programs/meal/new`, `:id`, `:id/edit` | same shape, plus `GET /diet/foods` for the food picker |
| Clients | `/clients?filter=`, `/clients/:userId` | `/coach/clients`, `adherence`, `workout-sessions`, `nutrition`, `payments` |
| Chat | `/chat`, `/chat/c/:conversationId`, `/chat/with/:userId` | `/chat/conversations`, SignalR hub `/hubs/chat` |
| Profile | `/profile`, `edit`, `pricing`, `earnings`, `preview-videos` | `/coach/profile`, `/coach/earnings`, `/coach/preview-videos`, `/files` |

## Rules taken from mobile

- A workout day is a title, a description and an ordered list of uploaded videos (`{ fileId, name }`).
  Each video is one exercise. The day is saved only when the title is set and every video finished uploading.
  Days that came from the older exercise-based editor lose their exercises without a video when saved (the editor warns).
- A program has up to 7 days. Only one workout and one meal program is published at a time per the backend.
  A published program can only be deleted after it is unpublished.
- A meal has numbered options (`optionNumber`), shown one per day in rotation.
  The totals card counts the first option of each meal.
- Client adherence is graded high (85+), good (70+) or low. Low shows the needs-review tag.
  Low activity means no workout for 7 days or ever. Ended subscriptions skip activity sections.
- Preview videos: at most 5, can be reordered by drag.
- Video uploads use the shared multipart `FileUploadService` (200 MB limit). Mobile compresses videos first and uses tus; the web does neither.
  Processing status comes from `GET /files/videos` and is polled every 5 seconds while a video is pending.

## Structure

```text
apps/coach/src/app/
  core/auth        coach profile guard
  core/layout      shell, navigation, links, preset (coach-theme.ts)
  core/ui          design system primitives (button, text-field, sheet, tiles, icons, ...)
  core/format      locale aware numbers, money and dates (Uzbek month names are written out)
  core/clients     client model and rules shared by dashboard, clients and profile
  core/payments    payment model and row
  core/videos      video status, tag and the full screen player
  core/theme       light, dark, system theme store
  features/<x>     auth, dashboard, programs, clients, chat, profile
```

## Design system

Tokens come from the mobile `Palette`, `Dimensions` and Inter type scale.
Colors are defined in `core/layout/coach-theme.ts` (`semantic.colorScheme.light|dark.coach`) and exposed as `--c-*` custom properties in `styles.css`.
Shared classes (`c-card`, `c-tag`, `c-chip`, `c-button`, `c-pill`) live in `ui.css`.
Icons are the mobile SVGs in one sprite (`core/ui/icon/icon-sprite.html`), drawn with `currentColor`.
Mobile bottom sheets are `Sheets` (confirm, actions, choose, prompt): a bottom sheet on phones and a centered dialog from 768px.
The app also keeps Optimus UI for the toast host and the preset.

## Texts

All coach texts live in the `coachApp` section of the dictionary (`libs/core/src/i18n/translations/<lang>/coach-app.ts`).
They are ported from the mobile ARB files, including ICU plurals, which `interpolate` resolves with `Intl.PluralRules`.

## Operations

The SignalR chat connects through `API_BASE_URL + /hubs/chat`.
The dev proxies already forward WebSockets (`ws: true` for prod).
The production nginx (`nginx/default.conf.template`) forwards the `Upgrade` and `Connection` headers on `/api/`, so the hub works behind it.
The external TLS nginx in front of the swarm stack must forward them as well (`docs/deployment.md`).
