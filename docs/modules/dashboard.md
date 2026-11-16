# Dashboard feature

## Purpose

The admin home page shows mobile app analytics from Firebase Analytics (GA4 property `553445328`).
The admin picks the app (Soldier or Trainer) and the period (7, 28 or 90 days); every period ends yesterday.
The header (title, the period and comparison dates, app and period filters, section tabs) stays on top while the page scrolls.
Four tabs split the content:

- Overview: KPI cards with the change against the previous period of the same length, daily activity (chart or table), users in the app now, key actions.
- Behaviour: top screens, events (top 10, all on demand, known names translated), workouts, food entries.
- Technology: platforms, app versions with crash-free share, countries, operating systems, devices.
- Retention: weekly cohorts.

## Backend

There is no backend endpoint yet (MVP, decided 2026-11-16).
The panel builds GA4 Data API requests itself and posts them to `/api/ga4/<method>`:

- `POST /api/ga4/batchRunReports` for the audience, reach and engagement blocks (3, 5 and 5 reports)
- `POST /api/ga4/runReport` for retention (cohort report)
- `POST /api/ga4/runRealtimeReport` twice for the realtime block (platforms with a `TOTAL` row, and users per minute)

Only the local dev server answers these routes.
`scripts/dev-proxy/ga4.mjs` is a Vite proxy `bypass` that signs a JWT with the service account key, gets a Google access token (cached for an hour), calls `analyticsdata.googleapis.com/v1beta/properties/<id>:<method>` and writes the answer itself.
The key never reaches the browser or the bundle.
Any Google failure becomes `503` with ProblemDetails title `Analytics.Unavailable` and the Google message as detail, which is also printed in the dev server terminal with the `[ga4-proxy]` prefix.
The proxy never answers `401`, so a GA4 failure cannot trigger the session refresh and sign the admin out.

| Env variable            | Default                         | Purpose                      |
| ----------------------- | ------------------------------- | ---------------------------- |
| `TOFAN_GA4_KEY_FILE`    | `~/.config/tofan/ga4-key.json`  | service account JSON key     |
| `TOFAN_GA4_PROPERTY_ID` | `553445328`                     | GA4 property                 |

The service account is `tofan-analytics-reader@tofan-68065.iam.gserviceaccount.com` with the Viewer role on the property only.
Never commit the key or put it in an environment file of the panel.

`npm start`, `npm run start:staging` and `npm run start:prod` load `scripts/dev-proxy/admin.<env>.mjs`, which adds the `/api/ga4` entry in front of the backend entry from `proxy*.conf.json`.
The deployed panel has no such route, so the dashboard shows the "could not load" message there until the backend serves analytics.

### Moving to the backend

The planned contract is in `.scratch/admin-analytics/backend-report.md`.
When the backend endpoints exist, replace the files in `services/` (DTOs, mappers, `AnalyticsService`) and delete `services/ga4-streams.ts` and `scripts/dev-proxy/ga4.mjs`.
The models, the store and the components stay.

## GA4 facts the code depends on

- Streams: Soldier Android `15747799186`, Soldier iOS `15747727917`, Trainer Android `16101106871`, Trainer iOS `16105759556`, Trainer web `16252205625` (`services/ga4-streams.ts`).
- Every report filters by stream only, like the Firebase console.
  A user-scoped filter such as `customUser:environment != dev` is applied inconsistently by GA4: the same events counted 226 by `eventName` and 235 by `customEvent:source`, and cohort week 0 came out larger than the cohort.
  The `environment` user property is also `(not set)` for more than half of the users, so `environment = prod` would drop real users.
  Dev builds are counted; on 2026-11-16 that was 1 Soldier user and about 12 Trainer users.
- Cohorts must be continuous weeks; retention asks for the 8 complete Monday to Sunday weeks before the current week.
- Workout and food blocks read the registered custom definitions `source`, `meal_type`, `duration_minutes`, `completed_sets` and `new_personal_records`.
  A block is hidden when its event (`workout_finished`, `food_logged`) has no rows, which is the case for the Trainer app.
- Standard reports lag 24-48 hours; realtime covers the last 30 minutes and refreshes every minute.

## Screens

| Route | Page                                         | Access                   |
| ----- | -------------------------------------------- | ------------------------ |
| `/`   | `pages/dashboard-page` (`DashboardStore`)    | `authGuard` (admin role) |

## Structure notes

- `DashboardStore` loads five blocks in parallel with `Promise.allSettled`; a failed block is `null` and sets `failed`, the others still render.
  A load counter drops answers from an older load after the app or period changed.
- `models/` hold plain data and pure rules: period spans, cohort weeks, retention rate, relative change, usage rows, number formatting, labels.
- `services/ga4-table.ts` reads a GA4 report by header name, so mappers never depend on column order.
- Components are presentational: `audience-summary`, `activity-trend`, `realtime-panel`, `key-events`, `engagement-panels`, `activity-panels`, `reach-panels`, `retention-table`, with `kpi-card`, `usage-list` and `dashboard-panel` (heading, hint and a `[panelAction]` slot) as building blocks.
- A KPI shows a percent change only when the previous period had at least 30 active users (`isComparable`); below that it shows the previous value, so a jump from 2 to 38 users is not shown as +1 800%.
- Blocks without data are hidden: key action cards with zero events, the workout and food panels for the Trainer app, the realtime chart when nobody is online.
- While a reload runs the content stays on screen at half opacity with a spinner by the title, instead of a skeleton flash.
- Dates: Uzbek dates are built by hand (`15.11`, `15.11.2026`) because browsers and Node format `uz-UZ` differently; Russian and English use `Intl` (`19 окт.`, `19 Oct`).
- Charts use `libs/shared/src/components/chart` (`app-chart`, line and bar only) over Optimus `p-chart` and `chart.js` 4.6.1.
  Series colors are fixed slots validated for color vision deficiency: light `primary-500, amber-500, violet-500, rose-500, teal-500`, dark `primary-500, amber-600, violet-500, rose-500, teal-600` (the dark set is chosen when `<html>` has `app-dark`).
  A series past the fifth slot gets the muted text color instead of a cycled hue.
  The palette is read again when the theme or primary color changes; the tooltip shows the full date from the `titles` input.

## Tests

- Model rules: `analytics-period`, `retention`, `usage`, `analytics-format`, `analytics-labels`, `engagement`.
- Mappers and request helpers: every file in `services/` except the service, with reports built by `services/ga4-fixtures.ts`.
- Store: block loading, partial failure, empty period, app switch, stale answers, realtime refresh failure.
- Components: `kpi-card`, `usage-list`, `audience-summary`, `key-events`; shared `chart-config`.
