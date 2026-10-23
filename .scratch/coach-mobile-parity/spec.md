# Coach web = Tofan Trainer mobile

Status: resolved

## Goal

The coach web app (`apps/coach`) must be the same product as the Flutter coach app `tofan_trainer` (`/Users/otabek/dev/startups/tofan/tofan_trainer`).
Same features, same navigation, same screen flows, same texts and the same design.
The mobile `lib/` folder is the specification: screens in `lib/features/*/ui`, widgets in `lib/features/*/widgets`, rules in blocs and `utils/`, texts in `lib/l10n/app_{uz,ru,en}.arb`, tokens in `lib/core/theme` and `lib/core/constants/dimensions.dart`, primitives in `lib/components`.

## Decisions (user, 2026-10-22)

- Scope is everything: features, tabs, flows and design.
- New sections: Dashboard, Chat with conversation, Earnings, Pricing, Preview videos with video processing status.
- The Content tab (own exercises and foods) is hidden from navigation, as on mobile.
- Design comes from the mobile code and is ported to the Optimus preset and coach CSS tokens.
  It replaces the earlier "Coach Workspace v2" prototype (`.scratch/redesign-prototype/coach-v2`).
- `@microsoft/signalr` is approved for real-time chat (`/hubs/chat`).
- Web-only extras are removed: client weight chart, workout and nutrition reports, food diary, exercise-picker workout days with sets and reps.
  A workout day is a title, a description and an ordered list of uploaded videos, exactly like mobile.
- Desktop: a left sidebar with the five tabs and centered content (about 760px) built from mobile-style cards.
  At phone width the mobile floating bottom tab bar is shown.
  Mobile bottom sheets open as bottom sheets at phone width and as centered dialogs on desktop.

## Navigation

Tabs in this order: Dashboard, Programs, Clients, Chat, Profile.
Pushed screens: client detail, conversation, workout program detail, workout day editor, create or edit workout program, meal program detail, create or edit meal program, food picker, edit profile, pricing, earnings, preview videos.
Sign-in and onboarding stay outside the shell.

## Backend

Every endpoint the mobile uses exists on `api.peaktofan.com` (checked against the live Swagger on 2026-10-22).
Main ones: `/coach/dashboard`, `/coach/profile`, `/coach/earnings`, `/coach/earnings/payments`, `/coach/clients`, `/coach/clients/{userId}` with `adherence`, `workout-sessions`, `nutrition`, `payments`, `/coach/workout-programs` with days and order, `/coach/meal-programs`, `/coach/preview-videos` with order, `/diet/foods`, `/files`, `/files/videos`, `/chat/conversations`, `/chat/conversations/{id}/messages`, `/chat/conversations/{id}/read`, `/chat/conversations/with/{userId}`, SignalR hub `/hubs/chat`.

## Out of scope

- Firebase push notifications (mobile only); the web relies on the live chat hub and on reloading video status.
- Client-side video compression (mobile only); the web uploads the original file within the 200 MB limit.

## Tickets

See `issues/`. Each ticket is done when lint, all test targets and all builds pass and the screen matches the mobile screen in light and dark mode at phone and desktop width.
