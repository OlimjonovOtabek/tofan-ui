# Tofan Coach Workspace v2

2026-10-09. Scope: coach panelining desktop va mobil ko‘rinishi. Admin paneli bu iteratsiya doirasiga kirmaydi.

Bu API shartnomasiga mos interaktiv dizayn prototipi. Production Angular ilovasi va uning xizmatlari o‘zgartirilmagan. Haqiqiy API chaqiruvlari yoki autentifikatsiya yo‘q; namuna DTO ma’lumotlari brauzer xotirasida ishlatiladi. Saqlash amali haqiqiy request shaklini tayyorlaydi, ammo serverga yubormaydi. “Prototip holati → So‘rovlar” orqali shu shakllarni ko‘rish mumkin.

## Yangi dizayn qarorlari

- Desktopda to‘rt bo‘limli nomlangan navigatsiya va keng ish maydoni. Asosiy ekran dasturlar; alohida analytics dashboard yoki yangi aggregate endpoint kerak emas.
- Nashrdagi mashg‘ulot va menyu aniq ajratilgan. Qoralamalar alohida listda, profil/narx va mavjud published summary’lar asosidagi tayyorlik ko‘rinishi yon tomonda.
- Workout muharririda desktop uchun doim ko‘rinadigan kunlar paneli va yonidagi tahrirlash maydoni. Mobil uchun dastur → kun → mashqlar oqimi. Tanlangan kun ochilganda parent sarlavha qisqaradi; shu kunning parametrlari birinchi o‘ringa chiqadi.
- Mobil mashq/ovqat tanlash to‘liq ekran. Umumiy katalog va trenerning kontenti ajratilgan, qidiruv va bir nechta yozuvni tanlash bir joyda.
- Ovqatlanish sanalar oralig‘ida takrorlanadigan menyu sifatida loyihalangan. Har kun uchun alohida menyu ko‘rsatilmaydi.
- Explicit Save, dirty-state, chiqishda discard tasdig‘i, xatoda qiymatlarni saqlash va retry. Mobil muharrirda Save pastda doim ko‘rinadi.
- Katalog o‘qish/tanlash uchun; faqat shaxsiy kontent tahrirlanadi. Profil publish holati administratorga tegishli.
- Mijozlar ro‘yxatida summary’dagi ma’lumotlar: ism, maqsad, vazn va obuna sanalari. Adherence yoki vazn tarixi har bir mijozning detail response’iga tegishli; ro‘yxatga o‘ylab topilgan global ko‘rsatkichlar qo‘shilmagan.
- API moslik boshqaruvlari faqat dizayn tekshiruvi uchun tashqi panelda. Mobil content ustiga suzuvchi review paneli chiqarilmaydi.

## Repo ichida tekshirilgan kontrakt

| UI oqimi | API | DTO/manba | Dizayn cheklovi |
| --- | --- | --- | --- |
| Dasturlar ro‘yxati | GET `/coach/workout-programs`, GET `/coach/meal-programs` | `apps/coach/src/app/programs/coach-program.dto.ts`, `coach-programs.service.ts` | Mashg‘ulotda `name`, `goal`, `experienceLevel`, `isHomeWorkout`, `isPublished`, `dayCount`; menyuda sana oralig‘i va `mealCount` |
| Mashg‘ulot yaratish | POST `/coach/workout-programs` | `CreateWorkoutProgramRequest` | Faqat `name`, `goal`, `experienceLevel`, `isHomeWorkout` |
| Workout detail | GET `/workout-plans/{id}`, GET `/workout-plan-days` | `coach-workout-editor.service.ts` | Kunlar API’da plan filteriga ega emas; mavjud service barcha sahifalarni o‘qiydi, frontend `workoutPlanId` bo‘yicha ajratadi. UI boshqa plan kunlarini aralashtirmaydi |
| Kun yaratish | POST `/workout-plan-days` | `CreateWorkoutPlanDayRequest` | `workoutPlanId` faqat create payload’da; kun parametrlari va `exercises` |
| Kun tahriri | PUT `/workout-plan-days/{id}` | `UpdateWorkoutPlanDayRequest` | `workoutPlanId` update payload’iga qo‘shilmaydi |
| Kun olib tashlash | DELETE `/workout-plan-days/{id}` | `CoachWorkoutEditorService.deleteDay` | Faqat tegishli kun olib tashlanadi, saqlash bilan request tayyorlanadi |
| Mashq parametrlari | Kun request’ining `exercises` qismi | `CreateWorkoutDayExercise` | `targetSets` son, `targetReps` matn (`8–12` ham mumkin), `restSeconds` son, `targetWeightKg` son yoki `null` |
| Ovqatlanish yaratish | POST `/coach/meal-programs` | `CreateMealProgramRequest` | `startDate`, `endDate`, `meals`; menyuning o‘ylab topilgan nomi yoki kunlik payload yo‘q |
| Ovqatlanish detail/save | GET va PUT `/diet/meal-plans/{id}` | `MealProgramDetails`, `UpdateMealProgramRequest` | Sana oralig‘i, `isActive`, `meals`; `mealType`, ixtiyoriy `plannedTime`, `title`, `displayOrder`, `items` |
| Menyudagi ovqat | Meal request’ining `items` qismi | `CreateMealProgramItem` | Faqat `foodId`, `quantityGrams`, ixtiyoriy `estimatedCost`; hisoblangan kaloriya/makrolar write DTO’da yo‘q |
| Nashr qilish | POST `/coach/workout-programs/{id}/publish`, POST `/coach/meal-programs/{id}/publish` | `CoachProgramsService` | Har turdan bitta published dastur. Replacement oldingisini draft qiladi. O‘zgarishlar kelajakdagi obunachilarga; mavjud mijoz nusxasi o‘zgarmaydi |
| Shaxsiy mashqlar | GET/POST `/coach/exercises`, PUT `/coach/exercises/{id}` | `coach-content.dto.ts`, `coach-exercises.service.ts` | UZ/RU/EN nomlari majburiy; mavjud kontraktda exercise delete yo‘q, UI ham taklif qilmaydi |
| Umumiy mashq katalogi | GET `/exercises` | `CoachContentService` | Tanlash uchun. Admin CRUD amallari coach’da ko‘rinmaydi |
| Shaxsiy ovqatlar | GET `/diet/custom-foods`, POST `/coach/foods`, PUT/DELETE `/diet/custom-foods/{id}` | `CoachFoodRequest`, `CoachFoodsService` | Bitta `name`, porsiya va oziq qiymatlari; ixtiyoriy fiber. Admin uchun uch tildagi food formasi qo‘llanmagan |
| Umumiy ovqat katalogi | GET `/diet/foods` | `CoachFoodCatalogSummary` | Katalog va owned source alohida |
| Profil | GET/PUT `/coach/profile` | `CoachProfileResponse`, `UpdateCoachProfileRequest`, `coach-profile.mapper.ts` | Save payload: `displayName`, `bio`, `photoFileId`, `monthlyPrice`; `isPublished` chiqarilmaydi |
| Mijozlar | GET `/coach/clients` | `CoachClientSummary` | Summary’da yo‘q adherence, session yoki revenue ko‘rsatkichlari qo‘shilmaydi |
| Mijoz detail | GET `/coach/clients/{userId}` va `/weight-history`, `/workout-sessions`, `/adherence`, `/nutrition`, `/food-logs` | `coach-client-detail.dto.ts`, `coach-client-detail.service.ts` | Har bir blok mustaqil response. Nullable vazn `—` ko‘rinishida; vazn tarixi faqat tegishli fixture mijozda |
| Foto/video | Umumiy shared file upload oqimi | `libs/shared/src/utils/file-upload-rules.ts`, `FileUploadService` | Rasm JPG/PNG/WebP, 10 MB; video MP4/M4V/MOV/WebM, 200 MB. Prototip faylni upload qilmaydi va mavjud bo‘lmagan file ID yaratmaydi |

Readiness bu mavjud profile va program response’laridan olinadigan yordamchi ko‘rinish. Bu backend obuna berishga ruxsat berdi degan kafolat emas; backend authoritativ.

## Avvalgi prototipdan tuzatilgan xatolar

- Meal day selector chiqarildi: bu kontraktda per-day menyu yo‘q.
- Mashq takrorlari number input emas, text input. Ixtiyoriy vaznning bo‘sh qiymati `null`.
- Shaxsiy ovqatning bitta nomi bilan umumiy catalog’dagi localized nomlar farqlangan.
- Coach exercise delete va profile publish chiqarildi.
- Workout detail va kunlar alohida response; plan metadata’sini o‘zgartirish uchun tekshirilmagan PUT endpoint qo‘shilmagan.
- Menyudagi quantity o‘zgarsa oziq qiymatlari qayta hisoblanadi; ularning read fields’i write payload’iga qo‘shilmaydi.
- Katalog, trener kontenti va admin boshqaruv amallari aralashtirilmaydi.

## Tekshirish

`node .scratch/redesign-prototype/coach-v2/contract-check.mjs`:

- Workout update va nested exercise request’lari aniq fieldlar bilan.
- `targetReps` matn, nullable `targetWeightKg`.
- Meal request’da per-day maydonlari va calculated nutrition yo‘q.
- `plannedTime` nullable, `estimatedCost` nullable.
- Profil request’da `isPublished` yo‘q; nom trim qilinadi va bo‘sh bio null bo‘ladi.
- Porsiya asosidagi nutrition scaling, masalan 100 g / 165 kcal → 200 g / 330 kcal.
- Day fixture’lar plan bo‘yicha ajratiladi va nested record identifikatorlari noyob.

Brauzer tekshiruvlari:

- 1440px desktop va 360/390/430px mobil ekranlarda dasturlar, mijozlar, kontent, profil, kunlar ro‘yxati, tanlangan kun, menyu va uch mijoz report tabi: gorizontal sahifa overflow yo‘q.
- Qidiruv, dirty state, chiqish ogohlantirishi va bekor qilganda qoralama saqlanishi.
- Full-screen picker, own/catalog manbalari, multi-select va tanlangan mashqning qo‘shilishi.
- Saqlash xatosi, draftning saqlanishi, retry va request shakli.
- Gramm miqdorini o‘zgartirish, qayta hisoblash, meal save payload.
- Nashrdagi dastur replacement tasdig‘i va bitta published holati.
- Yangi dastur nom validatsiyasi, bo‘sh dastur yo‘nalishi, kun yaratish va POST payload.
- Food serving validatsiyasi va tekshirilmagan exercise delete/profile publish amallari yo‘qligi.
- Lighthouse snapshot: mobil tanlangan kun muharririda Accessibility 100, Best Practices 100; desktop profilida Accessibility 100, Best Practices 100. Bu tanlangan ekranlar bo‘yicha avtomatik tekshiruv, butun ilova accessibility sertifikati emas.
- Tekshirilgan oqimlarda browser console error/warning yo‘q.

## Chegaralar

Bu visual/interaction konsept, real API integratsiya emas. Repo kontrakti va mavjud service’lar o‘qib tekshirildi; deployed endpointlar yoki real trainer hisoblari bilan smoke test bajarilmadi.

Interfeys hozir o‘zbekcha va light mode. Production bosqichida RU/EN, theme tokenlari, haqiqiy upload progress/retry, report date filtering, session paging va food-log drilldown mavjud Angular oqimlari bilan to‘liq bog‘lanadi. Auth, refresh, guards, Keycloak yoki admin xizmatlariga o‘zgartirish kiritilmaydi. Prototipni Angular ichiga ko‘chirishda Optimus UI va Signal Forms ishlatiladi; mavjud DTO/store/service chegaralari saqlanadi. Lint, admin/coach tests va builds production implementatsiyasi uchun alohida gate.

## Ko‘rish

- `http://127.0.0.1:4780/coach-v2/review.html` — desktop va mobil screenshotlarni solishtirish.
- `http://127.0.0.1:4780/coach-v2/` — interaktiv desktop.
- `http://127.0.0.1:4780/coach-v2/mobile.html` — desktop brauzerida ham sinash mumkin bo‘lgan 360/390/430px mobil iframe.

Repo ildizidan bir buyruq:

```sh
python3 -m http.server 4780 --bind 127.0.0.1 --directory .scratch/redesign-prototype
```
