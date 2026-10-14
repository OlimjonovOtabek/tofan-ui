# Coach app

## Purpose

The coach app is a separate Angular application in the Nx workspace. It uses the admin app's visual
language on desktop and a dedicated bottom navigation on mobile. Coach access requires the `trainer`
role. A trainer card is required by the backend before profile data is available.

## Implemented flows

- Sign in through the existing backend authentication service. The shared auth store accepts the
  required role from app configuration; admin remains `admin` by default and Coach supplies `trainer`.
- Responsive shell with Programs, Clients, Content and Profile navigation.
- Read and update `/coach/profile`, including display name, bio, photo and positive monthly price.
- Upload profile photos through the shared file upload service with progress reporting.
- Read workout and meal program summaries from `/coach/workout-programs` and `/coach/meal-programs`.
- Read active client summaries from `/coach/clients`.
- Create and update owned exercises, with video upload progress and retry. Search public and owned
  exercise catalogs when composing a workout day.
- Create, update and delete owned foods. Compose meal programs from public and owned foods, with gram
  quantities and client-side nutrition estimates.
- Create, edit, explicitly save and publish workout and meal programs. Replacing a published program
  asks for confirmation.
- Read client profile, weight history, workout sessions, adherence, nutrition and food logs.
- Coach and admin share auth, HTTP, feedback, i18n, UI components and models through Nx libraries.

## UI

Coach uses Optimus UI buttons, cards, dialogs, avatars, selectors, numeric inputs, toggles, tabs,
messages, loading skeletons and upload progress bars. Form controls use the existing Signal Forms
adapters. Colors follow Optimus theme tokens; the shell offers language and light/dark controls.
Mobile navigation stays at the bottom, forms use a single column and exercise/food pickers open in
full-screen dialogs. Coach loads its own styles without importing the admin app's styles.

## API constraints

- API paths, DTOs and response shapes were checked against the supplied backend overview and the
  current Swagger contract. Deployed endpoint availability remains unverified.
- Profile photo upload uses the shared `avatar` category. Existing upload validation allows JPG, PNG
  and WebP up to 10 MB.
- The coach workout-session response is nested in a Result envelope; the shared `ApiClient` unwraps
  the outer envelope. Client analytics calls send `X-Time-Zone` when the browser has a timezone.
- The source food enum value `5` is not added to the admin food enum. Coach list reads only fields it
  needs and does not pass trainer-owned foods through the admin mapper.
- Workout-plan day listing has no plan filter in the verified API; the editor pages through day
  results and filters by `workoutPlanId` in the app.
- The meal-plan create/update DTO has a date range and meal-time food entries, without a per-day
  selector. The editor therefore treats the menu as recurring across that range until the backend
  exposes a day-specific contract.

## Validation and limitations

Run `npm run lint`, `npm test`, `npm run test:coach`, `npm run build` and `npm run build:coach`.
Coach has a separate container build in `Dockerfile.coach`; see `docs/deployment.md` for an isolated
image check and rollback guidance. Live API smoke testing still needs an authorized non-production
environment and trainer account. Upload retry starts a new request; it does not resume a partial
upload or continue in the background.

## Workspace

Nx 23.3 orchestrates the existing Angular CLI builders through per-project targets. This preserves
the current Angular build setup while providing separate `admin` and `coach` projects, Nx caching and
shared library dependency tracking. Coach build output is `dist/coach/browser`; admin retains
`dist/tofan-ui/browser` for its existing Docker image.

## Coach Workspace v2 qayta dizayni (2026-10-11)

Prototip: `.scratch/redesign-prototype/coach-v2`. Ticketlar: `.scratch/coach-redesign/issues`.

- Dasturlar: jadval ko'rinishidagi ro'yxat (Dastur / Kunlar / Holat / Amal), nashrdagi mashg'ulot kartasida maqsad, daraja va uy/zal, tayyorlik panelida izoh. Yuklanish tugamaguncha nashrdagi kartalar va tayyorlik skeleton ko'rsatadi (`CoachProgramsStore.loaded`).
- Kontent: alohida "hub" sahifa olib tashlandi. `/content` `/content/exercises` ga yo'naltiradi; `CoachContentHeader` sarlavha va Mashqlar/Ovqatlar tablarini beradi, ro'yxatlar karta to'ri.
- Mashg'ulot muharriri: `CoachWorkoutDayList` (kunlar paneli), `CoachWorkoutDayEditor` (tanlangan kun va mashqlar jadvali), `CoachWorkoutDayDialog` (kun qo'shish/sozlash), `CoachExercisePicker`. Mobilda dastur, kun, mashqlar oqimi.
- Ovqatlanish muharriri: `CoachMealCard`, `CoachMealTotals` (jami va sana oralig'i), `CoachMealDialog`, `CoachFoodPicker`.
- `CoachSaveBar` ikkala muharrirning umumiy saqlash paneli.
- Mijozlar: ro'yxat jadval (mobilda kartalar), detailda breadcrumb va "Faol obuna" belgisi.
- Profil: katalogdagi nashr holati paneli (nashrni administrator boshqaradi).

Backend kontrakti (staging swagger bo'yicha tuzatildi):

- `POST /coach/meal-programs` majburiy `name` talab qiladi; `name` sana oralig'idan hosil qilinadi (`mealProgramName`).
- Menyu o'qish va saqlash `GET/PUT /coach/meal-programs/{id}` orqali (`name`, `startDate`, `endDate`, `meals`).
- Ma'lum muammo: staging'da `PUT /coach/meal-programs/{id}` 500 qaytaradi (`UpdateMyMealProgramCommand`), shuning uchun menyuni saqlash backend tuzatilguncha ishlamaydi.
- Mashq yaratishda mushak guruhi va jihoz majburiy tanlov; backend `0` (noma'lum/yo'q) qiymatni rad etadi.

## Mijoz hisobotlari (2026-10-11)

Dizayn prototipi: `.scratch/redesign-prototype/coach-v2/client-reports.html`.

- `CoachClientDetailPage` faqat sarlavha va tablarni ushlaydi; har tab alohida komponent: `CoachWeightReport`, `CoachWorkoutReport`, `CoachNutritionReport` (+ `CoachFoodDiary`).
- `CoachPeriodControl`: 7 / 14 / 30 kun yoki "Boshqa" (sana maydonlari). Mashg'ulot tabida bitta davr rejaga amal qilish va seanslarni birga boshqaradi.
- `CoachReportState`: blokning bo'sh va xato holati; "Qayta urinish" faqat shu blokni yuklaydi (`CoachClientDetailStore.retry*`).
- Sof qoidalar testlangan: `coach-report-period`, `coach-weight-chart`, `coach-weight-stats`, `coach-nutrition-intake`, `coach-adherence-days`.
- Ovqatlanish: maqsad 0 bo'lsa foiz ko'rsatilmaydi ("Maqsad belgilanmagan"); maqsaddan oshgan iste'mol yashirilmaydi, chiziq to'ladi va ortiqcha miqdor yoziladi. O'rtachalar faqat yozuv bor kunlar bo'yicha frontendda hisoblanadi.
- Sana yorliqlari (`coach-report-dates`) tarjima kalitlaridan olinadi (`coach.clients.months.*`, `coach.programs.weekdays.*`), chunki brauzerlarda o'zbekcha oy nomlari yo'q.

## Papka tuzilmasi (2026-10-12)

Coach endi admin bilan bir xil tuzilmada:

```text
apps/coach/src/app/
  core/auth/       coach-profile.guard
  core/layout/     coach-shell, coach-theme
  core/profile/    coach-profile service, dto, mapper (guard, programs va profile ishlatadi)
  features/<x>/    <x>.routes.ts, *.store.ts, pages/, components/, models/, services/
  routes/          app.routes.ts (faqat loadChildren)
```

- Bo'limlar bir-birini import qilmaydi. Sheriff `apps/coach/src/main.ts` dan ham yuradi; teglar:
  `type:coach-core`, `type:coach-feature`, `type:coach-routes`.
- `programs` mashq va ovqat tanlash uchun `content` servislarini emas, o'zining
  `CoachProgramLibraryService` va `coach-program-library.dto.ts` faylini ishlatadi
  (`/coach/exercises`, `/exercises`, `/diet/foods`, `/diet/custom-foods`).
- Mijoz sahifasi beshta store'dan iborat (`CLIENT_DETAIL_STORES`): `CoachClientDetailStore` profilni yuklaydi va
  har bir hisobot store'iga (`weight`, `workout`, `nutrition`, `food-diary`) `show(userId)` / `clear()` chaqiradi.
  Eskirgan javoblarni `LatestRequest` tashlab yuboradi.
- Muharrir store'lari faqat draft holatini tutadi: draft qoidalari `models/coach-*-draft.ts` da, DTO o'girish
  `services/*.mapper.ts` da, tanlash oynasi holati `coach-exercise-picker.store.ts` va `coach-food-picker.store.ts` da
  (tanlash komponentining o'zi provide qiladi).
- Dasturlar sahifasi qismlari: `coach-published-programs`, `coach-program-readiness`,
  `coach-workout-create-dialog`, `coach-meal-create-dialog`.

## Enumlar (2026-10-12)

Coach backend raqamlarini admin bilan bir xil sxemada ishlatadi: DTO'da `enum ...Dto`, modelda satr union,
orasida `enumMap`, yorliqlar `Record<Union, TranslationKey>`. Komponent va store'larda raqam yurmaydi;
backend noma'lum raqam qaytarsa mapper xato tashlaydi va ekran xato holatini ko'rsatadi.

| Enum (Swagger nomi) | Union va yorliqlar | DTO enum va `enumMap` |
|---|---|---|
| `MuscleGroup`, `EquipmentType`, `ExerciseDifficulty`, `ExerciseType`, `ExerciseGender` | `libs/shared/src/models/exercise-attributes.ts`, `exercise-attribute-labels.ts` | `libs/shared/src/models/exercise-attributes.dto.ts` |
| `FitnessGoal`, `MealType` | `apps/coach/src/app/core/fitness/` | o'sha papkadagi `*.dto.ts` |
| `FitnessExperienceLevel`, `DayOfWeek`, `WorkoutSplitType` | `features/programs/models/coach-program-attributes.ts` | `features/programs/services/coach-program-attributes.dto.ts` |
| `WorkoutSessionStatus` | `features/clients/models/coach-session-status.ts` | `features/clients/services/coach-session-status.dto.ts` |

- Mashq enumlari admin'dagi `features/exercises` dan `libs/shared` ga ko'chirilgan, chunki ikkala ilova ishlatadi.
- Faqat DTO'da tiplangan, UI ishlatmaydigan enumlar: `WorkoutPlanSourceDto`, `FoodSourceDto`, `ServingUnitDto`, `GenderDto`.
- `CoachAdherenceDayResponse.dayOfWeek` hali `number`: UI uni ishlatmaydi va Swagger qaysi enum ekanini aytmaydi.
- DTO → model: `coach-exercise.mapper.ts`, `coach-workout-program.mapper.ts`, `coach-workout-day.mapper.ts`,
  `coach-meal-program.mapper.ts`, `coach-client.mapper.ts`. Servislar model qaytaradi.
