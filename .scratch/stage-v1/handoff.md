# Handoff: tofan-ui stage v1 (Tier, Tariffs, Benefits, Platform fee)

Repo: `/Users/otabek/dev/startups/tofan/tofan-ui`, branch `feat/stage-v1` (from `main` at `13564e7`).
Date: 2026-11-07.

## Where things stand

- Planning is done and approved by the user: grilling (22 decisions), spec, and 13 tickets.
- No code for the tickets is written yet. Nothing on `feat/stage-v1` is committed or pushed.
- Next step: ticket 01, which is already implemented as uncommitted edits (see below). Commit it, open the PR, merge it after the gates pass, then go on to the next tickets.
- The user's last question ("Boshlaymi?" = shall I start ticket 01) has not been answered yet. Wait for a go before committing.

## Artifacts (read these, they are the source of truth)

- Spec: `.scratch/stage-v1/spec.md` (status `ready-for-agent`, decisions, contracts, test seams, out of scope).
- Tickets: `.scratch/stage-v1/issues/01-*.md` to `13-*.md`, with blocking edges. One ticket = one PR, in dependency order.
- Glossary: `CONTEXT.md` at the repo root (Soldier, Trainer, Client, Coach panel, Tariff, Trainer subscription, Tier, VIP price, Benefit, Platform fee). Use these terms.
- Backend hand-off: `/Users/otabek/Library/Containers/ru.keepcoder.Telegram/Data/tmp/angular-stage-v1.md` (Telegram temp, may disappear; the spec captures it).
- Platform fee v1 doc: `/Users/otabek/Downloads/admin-ui-platform-fee-v1.md`. The v1.1 doc (with `providerFeePercent`) is missing.
- Stage Swagger: `https://api.stage.peaktofan.com/swagger/v1/swagger.json`. Prod Swagger: `https://api.peaktofan.com/swagger/v1/swagger.json`. Re-fetch them, nothing local survives.
- Flutter reference for the Coach panel: `/Users/otabek/dev/startups/tofan/tofan_trainer`, branch `origin/dev` (VIP price form, VIP tag, `canMessage`, read-only chat, ARB texts in `lib/l10n/app_{uz,ru,en}.arb`, keys `coach_pricing_vip_*`, `coach_profile_vip_price`, `client_tier_vip`, `conversation_read_only`).

## Uncommitted state on `feat/stage-v1`

- Ticket 01 edits: `proxy.staging.conf.json` (target `https://api.stage.peaktofan.com`, `ws: true`), `CLAUDE.md`, `AGENTS.md`, `README.md` (stage instead of the closed `*.157.90.117.20.sslip.io`).
- New: `CONTEXT.md`, `.scratch/stage-v1/`.
- `.scratch/admin-analytics/` is unrelated and untracked. Leave it out of commits.
- `docs/deployment.md`, `docs/backend-contract.md` and `docs/roadmap.md` still name the old server, but only as history. They were left on purpose.

## Facts found that are not obvious from the artifacts

- `PUT /admin/trainers/{id}/commission` and `commissionPercent` no longer exist on either prod or stage. The admin commission dialog calls a dead endpoint today (ticket 02 removes it).
- The admin Trainers list page sits exactly at the 200-line component limit. That is why ticket 02 has to land before ticket 03.
- Coach `toUpdateCoachProfileRequest` leaves out `null` fields. `vipMonthlyPrice` must be the exception: always present, `null` allowed.
- `LocalizedTextField` in `libs/shared` is Reactive Forms. New forms must use Signal Forms (`applyEach` exists in the installed Angular forms for array rows).
- `@angular/cdk` drag-drop is already used in the Coach panel (day editor, preview videos). Optimus has `orderlist`, `multiselect` and `checkbox` entry points.
- Admin error codes map to texts through `MESSAGES_BY_CODE` in core feedback plus the `errors` translations (uz, ru, en).

## Working rules the user set (beyond CLAUDE.md)

- Ask before starting implementation work. The user objected once when work started without an explicit go.
- Reply in Uzbek, terse. Never use the em dash.
- No Claude co-author or "Generated with" lines in commits or PRs (user rule overrides the harness attribution).
- `gh` resolves to the upstream `jakhangir-esanov/tofan-ui`. Always pass `--repo OlimjonovOtabek/tofan-ui` for PRs, base `main`. The user lets the agent open and merge PRs into the fork's `main` after the gates pass. Never push to upstream.
- `main` goes to stage (the backend deploys it with a new tag). Nothing goes to the production panels before the release day. The release date is still unknown.
- Stage E2E uses the `stage-admin` and `stage-coach` accounts. The user will paste the passwords. Never write them to the repo, docs or memory.
- After every ticket run `lint`, `test`, `test:coach`, `test:landing`, `build`, `build:coach` and `build:landing`. Nx caches results, so check exit codes, not the cache summary.
- Run `graphify update .` after code changes (project CLAUDE.md).

## Open items

- Release date (the user will say).
- Stage passwords (the user will paste them).
- `providerFeePercent` formula (`admin-ui-platform-fee-v1.1.md`). The user asks the backend. Until then the Platform fee page has no sample calculation.
- After ticket 13, draft the "ready on stage" message for the backend. The user sends it.

## Suggested skills

- `angular-engineering-best-practices`: before writing Angular code in any ticket.
- `new-feature`: tickets 05 (`platform-fee`) and 09 (`tariffs`), the new admin features.
- `tdd`: test-first for the service, mapper and store seams defined in the spec.
- `run` or `claude-in-chrome`: stage E2E of each ticket in the browser.
- `code-review`: review each branch against the spec and ticket before merging.
- `caveman-commit`: commit messages (Conventional Commits, no co-author lines).
- Also read `.agents/skills/optimus-ui/SKILL.md` (project skill file, not a Skill tool entry) before UI work, as CLAUDE.md requires.
