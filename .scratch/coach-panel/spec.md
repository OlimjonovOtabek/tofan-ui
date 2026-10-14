Status: ready-for-agent

# Nx workspace va Coach panel — to‘liq responsiv MVP

Manbalar: foydalanuvchi bilan tasdiqlangan grilling qarorlari; backendning 2026-10-04 sanali `admin-ui-trainer-v1.md` va `v2-trainer-overview.md` hujjatlari; mavjud admin trener moduli va uning testlari. User implement buyrug‘i bilan spec va undagi test chegaralari tasdiqlandi.

## Problem Statement

Tofan admin panelida trener kartalarini yaratish, e’lon qilish, obuna berish va tugatish ishlaydi. Trenerning o‘zi profil va narxini to‘ldiradigan, mashq va ovqat kontentini yuklaydigan, ikkala dasturini tuzadigan va faol mijozlar natijasini ko‘radigan web panel yo‘q. Backend ushbu oqim uchun coach endpointlarini hujjatlashtirgan, lekin mavjud frontend faqat admin hisoblarini qabul qiladi.

Trenerlar ko‘pincha telefonda ishlaydi: video yuklaydi, mashqlarni tanlaydi va dasturlarni tuzadi. Katta jadval yoki desktop dialoglarni kichraytirish bu ishlarni qulay qilmaydi. Admin va coach bir xil dizayn tizimini ishlatishi, lekin o‘z kirish siyosati, sahifalari va mustaqil chiqariladigan build’lariga ega bo‘lishi kerak.

## Solution

Mavjud Angular loyihasi Nx workspace’ga bosqichma-bosqich ko‘chiriladi. Admin va coach alohida ilovalar bo‘ladi; alohida domenlarda mustaqil deploy qilish imkoniga ega bo‘ladi. Umumiy UI va infratuzilma ikkala ilovaga kerak bo‘lganda ulashiladi. Adminning mavjud funksiyalari saqlanadi.

Coach to‘liq MVP’ga ega bo‘ladi: kirish, profil va narx, shaxsiy mashqlar va ovqatlar, mashq va ovqatlanish dasturlari muharrirlari, e’lon qilish hamda faol mijozlar natijalari. PC’da mavjud admin shabloni ishlatiladi. Mobil uchun telefon ekraniga mos navigatsiya, kartalar va alohida to‘liq ekranli tanlash oqimlari quriladi.

Boshlang‘ich ekran — Dasturlar. Unda profil/narx va ikkala dastur tayyorligi ko‘rinadi, yetishmagan qadamga o‘tish mumkin. Mobil navigatsiya: Dasturlar, Mijozlar, Kontent, Profil. Kontent ichida Mashqlar va Ovqatlar bor. Saqlash aniq tugma orqali bajariladi; saqlanmagan o‘zgarish bilan chiqishda ogohlantirish beriladi. MVP responsiv web; PWA keyin.

## User Stories

1. As a maintainer, I want admin and coach in one Nx workspace, so that shared frontend code is maintained together.
2. As a maintainer, I want separate application builds, so that admin and coach can be released independently.
3. As a maintainer, I want separate deployment configuration for each application, so that each can use its own domain.
4. As an admin, I want existing management screens to keep working after migration, so that daily operations continue.
5. As an admin, I want trainer creation, publication and subscription management preserved, so that coach onboarding still works.
6. As a maintainer, I want existing unrelated local changes preserved, so that the migration does not overwrite work in progress.
7. As a coach, I want to sign in with my existing account, so that I do not need another identity.
8. As a coach, I want access based on the trainer role, so that the panel follows backend authorization.
9. As an account holder without the trainer role, I want a clear access-denied screen, so that I understand why coach access is unavailable.
10. As a trainer without a trainer card, I want an onboarding explanation, so that I know an admin must create my card.
11. As an admin-only account holder, I want coach access refused, so that an admin role does not implicitly grant trainer access.
12. As an account holder with both roles and a trainer card, I want to use my own coach account, so that I can work as a trainer without impersonating someone else.
13. As a coach, I want session expiry and refresh handled cleanly, so that authenticated work follows existing session behavior.
14. As a coach, I want logout available, so that I can end my session on a shared device.
15. As a coach, I want the Programs screen to open after sign-in, so that my main work is immediately available.
16. As a coach, I want profile, price and program readiness shown, so that I see what prevents successful onboarding.
17. As a coach, I want readiness items to lead to the relevant screen, so that I can complete missing steps quickly.
18. As a desktop coach, I want the existing admin visual template, so that both panels feel consistent.
19. As a mobile coach, I want bottom navigation for Programs, Clients, Content and Profile, so that primary sections are easy to reach.
20. As a coach, I want Exercises and Foods grouped under Content, so that navigation stays compact.
21. As a coach, I want my display name and bio editable, so that clients can understand who I am.
22. As a coach, I want an avatar upload and preview, so that I can maintain my public profile photo.
23. As a coach, I want to set a monthly price in so‘m, so that my trainer card has the required price.
24. As a coach, I want a positive monthly price validated before saving, so that invalid input is explained immediately.
25. As a coach, I want failed profile saves to retain my input, so that I can retry without re-entering everything.
26. As a coach, I want my own exercises listed, so that my private content is separate from the public catalog.
27. As a coach, I want to create exercises with all three required names, so that content is available in every supported language.
28. As a coach, I want to edit my own exercises, so that I can correct content I own.
29. As a mobile coach, I want to choose a video from my device, so that I can upload content directly from my phone.
30. As a coach, I want upload format and size validation, so that unsupported videos are rejected before transfer.
31. As a coach, I want upload progress visible, so that I know a large transfer is still running.
32. As a coach, I want an explicit upload failure and retry action, so that a network error has a recoverable outcome.
33. As a coach, I want retry to retain other editor fields, so that a failed upload does not erase my work.
34. As a coach, I want my own foods listed, so that I can maintain trainer-owned nutrition content.
35. As a coach, I want to create a food with the backend-required nutrition and serving fields, so that it can be used in a meal program.
36. As a coach, I want to edit my own food, so that its nutrition data can be corrected.
37. As a coach, I want a confirmation before deleting my own food, so that removal is deliberate.
38. As a coach, I want backend deletion refusals explained, so that ownership or dependency rules are not hidden.
39. As a coach, I want to create a workout program as a draft, so that I can prepare it before publication.
40. As a coach, I want program name, goal, experience level and home-workout setting editable according to the contract, so that the program matches its intended audience.
41. As a mobile coach, I want to navigate from a workout program to its days and then to one day’s exercises, so that editing remains manageable on a small screen.
42. As a coach, I want to add, edit and remove workout days using supported backend operations, so that I can build a complete schedule.
43. As a coach, I want exercise selection in a separate full-screen mobile view, so that search and selection have enough space.
44. As a coach, I want catalog and own-exercise sources distinguished, so that I can find both without mixing ownership.
45. As a coach, I want to search exercises within the selected source, so that a large catalog remains usable.
46. As a coach, I want selected exercises added to the chosen day, so that the program contains the intended content.
47. As a coach, I want contract-supported exercise parameters editable in cards, so that I can configure training without a wide table.
48. As a coach, I want exercise entries removable from a workout day, so that mistakes can be corrected.
49. As a coach, I want to explicitly save program changes, so that I control when edits are submitted.
50. As a coach, I want a warning before leaving with unsaved changes, so that accidental navigation does not silently discard edits.
51. As a coach, I want failed saves to preserve editable state, so that I can correct errors and retry.
52. As a coach, I want loading and save progress shown, so that repeated actions are unnecessary.
53. As a coach, I want to publish a completed workout program, so that new subscribers receive it.
54. As a coach, I want an empty-program refusal explained, so that I know what to complete.
55. As a coach, I want confirmation when publishing a replacement program, so that I understand the previous published one becomes a draft.
56. As a coach, I want program lists refreshed after publication, so that the single published workout program is represented correctly.
57. As a coach, I want a persistent notice while editing a published program, so that I know existing subscribers’ copies will not change.
58. As a coach, I want to create a meal program as a draft, so that I can prepare nutrition content before publication.
59. As a mobile coach, I want meal editing organized by day, meal time and foods, so that I can compose a plan step by step.
60. As a coach, I want catalog and own foods selectable separately, so that both supported sources are available.
61. As a coach, I want to search foods, so that I can find ingredients quickly.
62. As a coach, I want quantities entered in grams, so that meal nutrition follows the backend contract.
63. As a coach, I want calorie and macro totals shown from contract-defined data and calculations, so that I can assess the meal plan.
64. As a coach, I want to edit and remove meal entries using supported operations, so that the draft can be corrected.
65. As a coach, I want to explicitly save the meal program, so that nutrition edits follow the same predictable flow as workout edits.
66. As a coach, I want to publish a completed meal program and understand empty-program errors, so that new subscribers receive valid content.
67. As a coach, I want replacement publication to confirm and refresh the meal list, so that only one meal program is shown as published.
68. As a coach, I want the future-subscribers-only notice in published meal editing, so that I understand the effect of changes.
69. As a coach, I want both programs’ readiness shown together, so that I know when an admin can grant a subscription.
70. As a coach, I want my active subscribers listed, so that I see only clients I am allowed to observe.
71. As a coach, I want a client overview with profile and subscription dates, so that I understand the client’s current relationship to me.
72. As a coach, I want client sections for Weight, Workouts and Nutrition, so that results are organized clearly.
73. As a coach, I want a weight-history chart with a date range, so that changes over time are visible.
74. As a coach, I want client workout sessions with server paging and supported filters, so that history is manageable.
75. As a coach, I want adherence shown with the backend’s returned date range, so that days before the relevant plan are not misrepresented.
76. As a coach, I want daily consumed and target nutrition shown, so that actual intake can be compared with the plan.
77. As a coach, I want a selected day’s food log, so that I can inspect recorded meals.
78. As a coach, I want date ranges constrained to backend-supported limits, so that requests remain valid.
79. As a coach, I want day-based results requested with my time zone, so that dates have consistent meaning.
80. As a coach, I want unavailable-client responses handled cleanly, so that expired or inaccessible subscriptions do not look like application failures.
81. As a mobile coach, I want readable cards and controls without primary-flow horizontal scrolling, so that I can work comfortably on a phone.
82. As a mobile coach, I want labels and save actions usable with the on-screen keyboard, so that editing is practical.
83. As a coach, I want keyboard access, accessible labels and visible focus, so that interaction does not depend on touch alone.
84. As a coach, I want loading, empty, error and retry states in each section, so that I understand incomplete or failed requests.
85. As a coach, I want Uzbek, Russian and English text and existing theme behavior, so that the panel follows the shared product conventions.
86. As a maintainer, I want each implementation phase validated for both applications, so that shared-code changes do not break admin.

## Implementation Decisions

**Workspace and boundaries**
- Nx is adopted in the existing repository; Angular 22, strict TypeScript, npm and Optimus UI remain the stack. Use a verified compatible Nx release; the checked compatibility matrix requires Nx 23.2 or newer for Angular 22.1. Match Nx plugin versions and validate the lockfile-resolved toolchain before installation.
- Admin and coach are separate applications with independent build and serve targets and independent deployment capability. Preserve existing admin behavior and documented commands where practical; migration-related command changes must be explicit.
- Share stable UI wrappers and infrastructure only where both apps need them. Do not move every feature into a library. Keep feature-driven structure and page-provided signal stores.
- Apps do not import each other. Features do not import other features. Shared infrastructure does not import app-specific features. Extend existing lint, no-comments and boundary checks to cover the migrated applications and libraries.
- No PrimeNG migration, new global state library, generated API clients, repository abstractions or Clean Architecture layers.
- Existing unrelated local changes are explicitly authorized to remain in place. Do not overwrite, commit or push them.
- Preserve the admin deployment behavior while adapting paths where migration requires it. Any Docker, NGINX or CI changes receive focused validation and a rollback note. Actual deployment is not authorized by this spec.

**Identity and access**
- Reuse the existing backend-mediated sign-in, refresh and logout contract. Do not switch to a new identity flow as part of this work.
- Coach requires the trainer realm role and a trainer card. An admin role alone grants no coach access. Accounts with both roles may use their own trainer card; no impersonation or trainer-selection mode is included.
- Separate app admission policy from reusable session mechanics. Existing admin admission remains admin-only. Existing login rejects non-admin accounts, so coach cannot reuse that admission check unchanged.
- Claims and tokens stay inside auth infrastructure; backend authorization remains authoritative. No direct Keycloak Admin API calls or privileged credentials in Angular.
- Missing trainer role and missing trainer card have distinct user-facing states. Do not invent an onboarding or role-assignment endpoint.

**Navigation and interaction**
- Desktop reuses the admin template, theme and component language. Mobile uses dedicated responsive layouts rather than compressed desktop tables.
- Mobile primary navigation has four entries: Dasturlar, Mijozlar, Kontent, Profil. Kontent contains Mashqlar and Ovqatlar. Desktop shows corresponding sections in the sidebar.
- Dasturlar is the default landing screen. Show readiness from profile and program responses; do not invent an aggregate dashboard endpoint or a stronger readiness guarantee than available data supports.
- Workout editing flows through program, days and selected-day exercises. Mobile exercise selection occupies a separate full-screen view with catalog/own sources and search. Exercise parameters use cards and verified contract fields.
- Meal editing flows through day, meal time and foods, with catalog/own sources, gram quantities and contract-defined totals. Confirm the exact meal-plan structure before binding the UI to it.
- Explicit Save is the MVP persistence mechanism. Warn before discarding dirty editor state. Retain drafts on failed writes and prevent duplicate submissions. Autosave is excluded.
- Show a persistent published-program notice: changes apply only to future subscribers. Confirm replacement publication and reload the affected program list after success.
- Mobile includes upload progress, explicit failure and retry while preserving other form input. Do not promise resumable uploads or background completion; retry semantics follow the supported upload contract.
- All new labels, feedback and errors use the existing typed translation system in Uzbek, Russian and English. Use Signal Forms and existing feedback services.

**API contracts and backend rules**
- Profile uses GET and PUT `/coach/profile`. Update includes displayName, optional bio and photoFileId, and a required monthlyPrice greater than zero in so‘m.
- Avatar and exercise video uploads use POST `/files`, categories Avatar=3 and ExerciseVideo=1, followed by the returned file identifier. Exercise video maximum is 200 MB. Existing upload infrastructure supports these categories and progress. Verify whether the upload response is an identifier or an object before integrating; the overview does not settle that shape.
- Own exercises use POST, PUT and GET `/coach/exercises`; edits are ownership-restricted. All three name fields are required. Program selectors also read the public exercise catalog. Do not add a coach exercise-delete or deactivation operation without a verified contract.
- Own foods are created through POST `/coach/foods`, listed through GET `/diet/custom-foods`, and edited/deleted through `/diet/custom-foods/{id}`. Public food selection reads `/diet/foods`. Trainer food source is 5; existing food mappings support only 1–4 and must not be reused unchanged for trainer responses.
- Workout program creation/list/publication uses `/coach/workout-programs`. Creation fields are name, goal, experienceLevel and isHomeWorkout. Existing workout-plan and day APIs fill the program; use exact documented operations and DTOs rather than guessing URLs or bodies.
- Meal program creation/list/publication uses `/coach/meal-programs`. Creation follows the verified meal-plan contract without isActive. Existing meal-plan detail/update APIs fill it.
- Each trainer has one published workout program and one published meal program. Publishing another automatically returns the old program to draft. Empty publication is refused by the backend.
- Both published programs are required before an admin can grant a subscription. Subscription grants copy the programs; existing subscribers do not receive later edits. Coach never calls workout-plan activate for a trainer program.
- Client endpoints expose only the trainer’s active subscribers. Use the documented profile, weight-history, workout-sessions, adherence, nutrition and food-log APIs under `/coach/clients`.
- Client workout sessions return a Result envelope containing a paged list. Existing ApiClient unwraps the outer Result; map the inner list once. Test this actual response shape.
- Send X-Time-Zone on the relevant backend requests. Nutrition defaults to seven days with a maximum of 92; adherence defaults to 30 days; food logs default to today. Respect returned date ranges and verified query fields.
- Program lists and the client list are documented as arrays. Do not impose server paging contracts on those endpoints without verification. Existing paged endpoints use the established paging mapper and snake_case sort values.
- Add readable translations for confirmed coach-specific errors, including empty program and inaccessible client cases. Check the complete backend error code, including any prefix, before mapping the activation refusal.
- Backend remains authoritative for ownership, publication, subscription eligibility and calculated values. Financial expense data is not exposed to coach.
- No schema migration or backend implementation is included. The supplied overview reports backend work merged, but deployed availability is unverified.

**Delivery phases**
1. Nx migration and coach application scaffold, with admin regression checks.
2. Coach admission/session integration, profile and onboarding states.
3. Trainer exercises, foods and uploads.
4. Workout/meal editors, readiness and publication flows.
5. Active clients and result views, followed by the complete cross-application acceptance pass.

These phases are implementation order, not a reduction of the agreed full MVP. Every phase must leave both applications buildable. Publishing/deployment is a separate user-owned action.

## Testing Decisions

A good test checks visible state, emitted events, accepted/rejected operations and recoverable errors rather than private signals, exact DOM snapshots or the internal markup of Optimus UI.

- **Primary existing seam: feature stores.** Replace feature services with typed fakes, as existing trainer stores do. Verify loading, save/publication effects, errors, retained draft state, readiness and latest-request behavior. Prefer this seam over adding orchestration layers merely for tests.
- **Existing mapper and model-rule seams.** Follow trainer mapper, draft and grant tests. Verify exact DTO conversion, trainer food source 5, date handling, nutrition quantities/calculations as defined by the contract, and program publication state. Time-dependent rules accept an explicit now value.
- **Auth admission seam.** Extend existing session/store and functional guard tests. Verify admin-only access, trainer-only access, combined roles, missing cards, expired sessions and refresh/logout behavior without weakening the existing admin policy.
- **Targeted component integration seam.** Follow existing filter-component tests where behavior belongs to UI: mobile selection events, explicit save, dirty-navigation warning, form reset, upload failure/retry, and publication confirmation. Do not test UI-library internals or introduce broad snapshots.
- **HTTP contract seam where needed.** Use existing HTTP tests and Angular HTTP testing support to verify Result-envelope handling, X-Time-Zone request behavior and differing coach response shapes. Store mocks alone cannot prove these boundaries.
- **Acceptance proof.** Run both applications’ lint, tests and production builds at each relevant phase. Lint includes comment and dependency-boundary checks. Verify the admin regression flows and coach mobile/desktop flows with supported browser tooling.
- **Real API smoke flow.** Against an authorized non-production environment, verify card/role prerequisites, profile and uploads, content, both program publications, an admin-granted subscription and client results. Do not use production data or create role assignments through the frontend. If the backend or test accounts are unavailable, record the missing evidence rather than claiming end-to-end success.
- No new automatic E2E framework is assumed. Adding one requires an explicit testing decision; meaningful acceptance proof remains required using the available tooling.

## Out of Scope

- Actual production deployment, production migrations, realm configuration or account/role provisioning.
- Payment integrations, mobile store purchasing, subscription packages and discounts.
- Coach granting or ending client subscriptions; these remain admin operations.
- Admin impersonation, viewing another trainer as coach, and admin-only admission to coach.
- Automatic synchronization of published program edits into existing subscribers’ copies.
- Coach-created content appearing in the public catalog.
- Client financial expenses or edits to client data beyond documented coach read APIs.
- PWA, native applications, offline editing, autosave, resumable or guaranteed background uploads.
- Paid-video access protection, which the supplied overview explicitly defers.
- Multiple simultaneously published programs per type, a separate dashboard or unsupported delete/deactivate operations.
- SVG asset use: the later attachment was not assigned a role in this feature.
- Unrelated admin behavior fixes or broad refactors beyond those necessary for workspace migration and verified code reuse.

## Further Notes

- The plan and preservation of existing local changes were explicitly approved. The implementation request authorizes the test seams described above.
- Before the relevant feature phase, obtain or locate the full backend trainer-module documentation and current Swagger. The supplied short overview does not define complete program/day/meal DTOs, enums or every mutation body. Resolve those contracts before implementation; do not invent them.
- Verify deployed coach endpoints, accepted sort/query fields and independent coach sign-in. Source documents are dated 2026-10-04, not proof of current deployed behavior.
- Shared migration must preserve existing admin tests and functionality. Prior focused trainer verification passed 11 test files and 66 tests; it does not prove backend integration.
- Existing admin limitations include the first-100 trainer selector and overlapping list requests without stale-response protection. These are separate issues unless the requested shared migration directly requires a fix.
- The supplied overview’s opening one-month description does not define a self-service purchase flow. Current v1 subscriptions are granted by admin for 1–12 months, with one active trainer per user and extension when granted again to the same trainer.
- Subscription expiry is performed by the backend job. Frontend must not present the job as immediate at an exact minute or try to duplicate it.
- Detailed mobile layout can be refined during implementation within the confirmed navigation and editor flows; primary tasks must be practical on a phone, not merely fit its width.
