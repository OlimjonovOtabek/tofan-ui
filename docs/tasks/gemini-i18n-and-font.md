# Topshiriq: interfeysni uch tilga o'tkazish (uz / ru / en) va shriftni JetBrains Mono'ga almashtirish

> Kimga: Gemini (kod yozuvchi agent). Tuzilgan: 2026-09-19.
> Bu hujjat loyihani tushuntiradi va nima qilish kerakligini aniq belgilaydi. Kod yozishdan oldin
> **to'liq o'qing**, keyin 1-bo'limdagi fayllarni o'qing.

---

## 0. Qisqacha

Uchta ish:

1. **Interfeys tili.** Panelning barcha matnlari hozir o'zbekcha va kodga qattiq yozilgan. Uch til
   bo'lishi kerak: o'zbekcha (standart), ruscha, inglizcha. Til topbar'dan almashtiriladi, sahifa
   qayta yuklanmaydi, tanlov eslab qolinadi.
2. **Ma'lumotlarning tili.** Backend'dan keladigan mashq, ovqat va bildirishnoma shablonlarida uch
   tildagi maydonlar allaqachon bor (`name` / `nameUz` / `nameRu`, `title` / `titleUz` / `titleRu`,
   `body` / `bodyUz` / `bodyRu`). Ro'yxat va kartochkalarda tanlangan tildagisi ko'rsatilishi kerak.
3. **Shrift.** Lato o'rniga JetBrains Mono.

---

## 1. Loyiha haqida

**Tofan** — fitnes ekotizimi: foydalanuvchilar ("soldier"lar) mobil ilovada mashg'ulot, ovqatlanish
va vaznini yuritadi. Bu repozitoriy (`D:\Projects\tofan-ui`) — **faqat admin panel**: katalog
(mashqlar, ovqatlar, media), foydalanuvchilar (soldierlar, hisoblar, kirishlar jurnali) va
bildirishnomalar. Backend alohida repozitoriyda (`D:\Projects\tofan`, .NET 10, modular monolith).

**Stack:** Angular 22 (standalone, signals), TypeScript 6 strict, **Optimus UI 2**
(`@openng/optimus-ui` — PrimeNG 21 ning MIT fork'i, API bir xil, faqat import yo'llari boshqa),
Tailwind 4, Vitest, ESLint, Sheriff (modul chegaralari), Prettier.

**Avval o'qing (majburiy):**

| Fayl | Nima uchun |
|---|---|
| `CLAUDE.md` | Loyihaning qat'iy qoidalari. Unga zid ish qilinmaydi. Siz ham shu qoidalarga bo'ysunasiz |
| `.claude/rules/*.md` | Komponent, store, servis, forma va test qoidalari |
| `docs/architecture.md`, `docs/backend-contract.md` | Arxitektura va backend bilan kelishuv |
| `docs/modules/*.md` | Har bir feature nima qiladi va tuzog'i nima |
| `src/app/features/exercises` | Namunaviy feature — yangi kodni shunga o'xshatib yozing |

**Tuzilma (qisqacha):**

```text
src/app/
  core/       auth, http (ApiClient), layout (shell, topbar, menu, theme), config, feedback (toast, confirm, xato matnlari)
  features/   har biri: pages/, components/, models/, services/, <x>.store.ts, <x>.routes.ts
  shared/     biznesdan xoli: components (data-table, form-dialog, localized-text-field, file-upload), models, utils
  routes/     app.routes.ts (faqat loadChildren)
```

Feature'lar: `dashboard`, `auth`, `exercises`, `foods`, `media`, `soldiers`, `accounts`,
`user-sessions`, `notifications`, `not-found`.

**Eng muhim qoidalar** (to'liq ro'yxat — `CLAUDE.md` §13):

- Feature boshqa feature'ni import qilmaydi. `core` feature'ni import qilmaydi. `shared` faqat
  `shared`, `core/http`, `core/feedback` ni import qiladi (Sheriff tekshiradi).
- **Loyiha fayllarida hech qanday izoh (comment) yo'q** — TS, HTML, CSS, JSON. `npm run lint` yiqiladi.
  Markdown bundan mustasno.
- `any` yo'q, `!` bilan kompilyatorni jimitish yo'q, `::ng-deep`, `!important`, inline rang yo'q.
- `inject()`, `input()`/`output()`/`model()`, `@if`/`@for`, OnPush standart (yozilmaydi).
- **Yangi npm paketini foydalanuvchidan so'ramasdan qo'shmang.**
- Modellar (`models/`) — oddiy TypeScript: `@angular/*`, `@openng/*`, RxJS import qilinmaydi.
- Funksiya ≤ 25 qator, komponent ≤ 200, shablon ≤ 150 qator.

**Buyruqlar:**

```bash
npm start      # ng serve, /api -> http://localhost:5179 (backend lokal ishlab turishi kerak)
npm run lint   # ng lint + izohlar tekshiruvi + sheriff verify
npm test       # Vitest (hozir 48 fayl, 200 test — hammasi o'tadi)
npm run build
```

Har ish oxirida uchalasi ham o'tishi shart. Qoidani o'chirib qo'yib "o'tkazish" taqiqlangan.
Panelga kirish uchun admin login kerak — parolni foydalanuvchi o'zi kiritadi, siz kiritmaysiz.

---

## 2. Hozirgi holat

- UI matni **o'zbekcha va qattiq yozilgan**: taxminan 94 ta `.ts`/`.html` faylda. Qayerlarda:
  - shablonlar (`*.html`) va komponentlar (`protected` metodlar, konstantalar);
  - `features/*/models/*-labels.ts` — enum qiymatlari nomlari (`MUSCLE_GROUP_LABELS`, `GENDER_LABELS`, ...)
    va `toSelectOptions` bilan yasalgan select variantlari;
  - `core/feedback/error-message.ts` — backend xato kodlari uchun matnlar (`MESSAGES_BY_CODE`) va
    xato klassi bo'yicha umumiy matnlar;
  - `core/feedback/notification.service.ts` ("Bajarildi", "Xatolik"), `confirmation.service.ts`
    ("O'chirish", "Bekor qilish", "Ha");
  - store'lardagi toast matnlari (masalan, `"Mashq qo'shildi."`);
  - model qoidalaridagi xato matnlari (`BusinessRuleError('Fayl turini tanlang.', ...)`);
  - route `title` lari (`*.routes.ts`), menyu (`core/layout/menu/app-menu.ts`), login sahifasi;
  - `shared/components/data-table/data-table.html` — `currentPageReportTemplate="{first}-{last} / jami {totalRecords}"`.
- Sanalar `toLocaleString('uz-UZ', ...)` bilan 8 joyda formatlanadi. **Tuzoq:** brauzerda o'zbekcha
  oy nomlari yo'q (`dateStyle: 'medium'` → "2026 M09 14"), shuning uchun hozir `'short'` ishlatiladi
  (`2026-09-14`).
- Optimus UI'ning ichki matnlari (paginator, datepicker oy/kun nomlari, "No results found",
  confirm tugmalari) hozir inglizcha standartda.
- Uch tildagi ma'lumot maydonlari:
  - `features/exercises/services/exercise.dto.ts`, `features/foods/services/food.dto.ts`,
    `features/media/services/exercise-video.dto.ts` — `name`, `nameUz`, `nameRu`;
  - `features/notifications/services/notification.dto.ts` — `title/titleUz/titleRu`, `body/bodyUz/bodyRu`.
  - Modellarda `displayName` hozir `nameUz` ni, u bo'sh bo'lsa `name` ni qaytaradi
    (`features/exercises/models/exercise.ts`, `features/foods/models/food.ts`,
    `features/media/services/exercise-video.mapper.ts`).
  - Formalar uch tilni allaqachon kiritadi: `shared/components/localized-text-field`.
- Backend `Accept-Language` ni **o'qimaydi** (tekshirilgan): u doim uch maydonni ham qaytaradi.
  Til tanlovi faqat panelda.
- Shrift: `src/index.html` da Google Fonts'dan Lato, `src/styles/layout/core.css` da
  `font-family: 'Lato', sans-serif`.

---

## 3. 1-ish: interfeysni uch tilga o'tkazish

### 3.1 Yondashuv (qaror)

**Tashqi kutubxonasiz, o'zimizning kichik `core/i18n`.** Sabablar:

- `@angular/localize` har til uchun alohida build yig'adi va ishlab turgan ilovada tilni
  almashtirib bo'lmaydi. Bizga esa runtime'da almashtirish kerak.
- ngx-translate / Transloco — yangi dependency. `CLAUDE.md` bo'yicha buning uchun foydalanuvchining
  ruxsati kerak. Signal'lar va tiplangan lug'at bilan o'zimiz yozgan yechim yetadi.

Agar ishlash jarayonida kutubxonasiz bo'lmaydigan jiddiy sabab topsangiz, **to'xtang va
foydalanuvchidan so'rang** — o'zingiz qo'shmang.

### 3.2 Tuzilma

```text
src/app/core/i18n/
  locale.ts                 AppLocale = 'uz' | 'ru' | 'en', DEFAULT_LOCALE = 'uz', Intl locale xaritasi
  locale.store.ts           LocaleStore (providedIn: 'root'): locale signal, setLocale(), localStorage'da saqlash
  translator.ts             Translator: t(key, params?) — joriy tilda matn, {name} kabi parametrlar
  translate.pipe.ts         {{ 'exercises.title' | t }} (pure: false — signal o'zgarganda yangilanadi)
  date-format.ts            formatDate / formatDateTime(date, locale) — hamma 'uz-UZ' shular bilan almashadi
  optimus-translation.ts    Optimus UI matnlari har til uchun (paginator, datepicker, filter, ...)
  translations/
    uz/ common.ts, auth.ts, exercises.ts, foods.ts, media.ts, soldiers.ts, accounts.ts,
        user-sessions.ts, notifications.ts, errors.ts, layout.ts
    ru/ ... (xuddi shu fayllar)
    en/ ...
```

- **Lug'at tiplangan bo'lsin.** `uz` lug'ati asosiy; uning kalitlaridan `TranslationKey` tipi
  chiqariladi. `ru` va `en` lug'atlari shu tipga mos kelishi shart — kalit tushib qolsa,
  **kompilyatsiya xatosi** bo'lsin (masalan, `satisfies Dictionary`).
- Lug'atlar `core/i18n` ichida bo'ladi, chunki `core` feature'ni import qila olmaydi, feature'lar esa
  `core` ni import qila oladi. Feature o'chirilsa, uning kalitlari qoladi — bu qabul qilinadi.
- `LocaleStore`: standart til `uz`. Tanlov `localStorage` da saqlanadi. **Har bir o'qish va yozishni
  `try/catch` ga o'rang** (private oynada `localStorage` xato berishi mumkin). Til almashganda
  `document.documentElement.lang` ham yangilansin. `effect()` faqat shu tashqi side-effect'lar uchun
  ishlatilsin (`CLAUDE.md` §5).
- Topilmagan kalit: `uz` dagi matn, u ham bo'lmasa kalitning o'zi qaytsin (UI yiqilmasin).

### 3.3 Nimalarni o'tkazish kerak

1. **Shablon va komponent matnlari** — hamma feature'larda, `core/layout` va `auth` sahifalarida.
2. **`*-labels.ts` fayllar.** Modellar Angular'ni bilmaydi, shuning uchun
   `Record<MuscleGroup, string>` → `Record<MuscleGroup, TranslationKey>` bo'ladi, tarjima esa
   komponentda qilinadi. Select variantlari (`toSelectOptions`) til o'zgarganda qayta hisoblansin
   (`computed()` + `LocaleStore.locale()`).
3. **`core/feedback/error-message.ts`** — `MESSAGES_BY_CODE` qiymatlari kalitga aylanadi, matn joriy
   tilda qaytadi. Xato **matni bo'yicha emas, klass yoki `code` bo'yicha** tanlanadi (bu o'zgarmaydi).
   Model qoidalaridagi `BusinessRuleError` lar ham matn o'rniga kod/kalit ishlatsin.
4. **Toast va confirm** (`notification.service.ts`, `confirmation.service.ts`) va store'lardagi
   muvaffaqiyat xabarlari.
5. **Route sarlavhalari.** `title` da kalit turadi; `core/config/app-title.strategy.ts` uni tarjima
   qiladi va til almashganda sarlavhani yangilaydi.
6. **Menyu** — `core/layout/menu/app-menu.ts`.
7. **Optimus UI matnlari** — `inject(Optimus).setTranslation(...)` (`@openng/optimus-ui/config`) til
   almashganda chaqiriladi. Kamida: paginator, datepicker (oy va kun nomlari, "Today", "Clear"),
   select/filter "natija topilmadi", confirm "Yes"/"No". `data-table` dagi "jami" ham kalit bo'lsin.
8. **Sanalar.** `'uz-UZ'` ishlatilgan 8 joy `core/i18n/date-format.ts` ga o'tadi. `ru` → `ru-RU`,
   `en` → `en-GB` (yoki `en-US`). `uz` uchun hozirgidek raqamli format (`2026-09-14 19:35`), chunki
   brauzerda o'zbekcha oy nomlari yo'q.
9. **Til almashtirgich** — topbar'da (`core/layout/components/topbar`), mavzu tugmasi yonida:
   "Oʻzbekcha", "Русский", "English". Login sahifasida ham bo'lsin (u layout'dan tashqarida).

### 3.4 Tarjima sifati

- O'zbekcha matnlar hozirgidek qoladi (ular foydalanuvchi tomonidan tekshirilgan). Ruscha va
  inglizcha — tabiiy, qisqa, admin panel uslubida. Mashinaviy so'zma-so'z tarjima emas.
- Atamalar: "Soldier" — uchala tilda ham "Soldier" (mahsulot atamasi). "Hisob" — ru "Аккаунт",
  en "Account". "Kirishlar jurnali" — ru "Журнал входов", en "Sign-in log".
- Parametrli matnlar `{name}` bilan: `"{name}" o'chirildi.` → ru `«{name}» удалён.`,
  en `"{name}" deleted.`

---

## 4. 2-ish: ma'lumotlarni tanlangan tilda ko'rsatish

- `shared/models/localized-text.ts` (biznesdan xoli):
  `interface LocalizedText { en: string; uz: string; ru: string }` va
  `pickLocalized(text, locale)`. Bo'sh qiymatda zaxira tartibi: joriy til → `uz` → `en` → `ru`
  (birinchi bo'sh bo'lmagani). Unit test bilan.
- **Tekshiring:** backend'da `Name` / `Title` / `Body` inglizcha asosiy qiymatmi
  (`D:\Projects\tofan\src\Modules\Workout\...\Exercise.cs`, `Diet`, `Notification`).
  Hujjatda shunday deb faraz qilindi: `name` = en, `nameUz` = uz, `nameRu` = ru.
- Modellar (`Exercise`, `Food`, bildirishnoma shabloni, media'dagi `ExerciseChoice`) uch qiymatni
  saqlaydi. `displayName` o'rniga `displayName(locale)` yoki komponentda `computed()`. Mapper'lar
  `LocalizedText` yasaydi.
- Ro'yxatlarda "Nomi" ustuni bo'yicha saralash tilga mos maydon bilan ketsin: `name` / `nameUz` /
  `nameRu` (backend `SortField` ni snake_case'da kutadi, `core/http/paging.mapper.ts` o'giradi).
- Formalar o'zgarmaydi: uch tilni kiritish allaqachon bor.
- Media'dagi mashq tanlash ro'yxati (`features/media/services/exercise-videos.service.ts`) ham
  tilga moslansin.

---

## 5. 3-ish: shrift — JetBrains Mono

- `src/index.html` dagi Google Fonts havolasini JetBrains Mono'ga almashtiring
  (`family=JetBrains+Mono:wght@400;500;700&display=swap`). U kirill va lotin harflarini, shu jumladan
  `ʻ` (oʻ, gʻ) ni qo'llaydi.
- `src/styles/layout/core.css` da `font-family: 'JetBrains Mono', ui-monospace, monospace;`.
- Optimus UI komponentlari ham shu shriftni olishini tekshiring: input, select, datepicker, table,
  toast, dialog, button. Agar biror joy olmasa — `core/layout/theme/theme-preset-extension.ts`
  orqali design token bilan. **`::ng-deep` va `!important` taqiqlangan.**
- Monospace kengroq. Jadvallardagi ustun kengliklari (`DataTableColumn.width`), sidebar, topbar,
  filtr panellari va dialoglarni 1280px va 375px (mobil) kengliklarda tekshiring. Kerak bo'lsa
  asosiy shrift o'lchamini biroz kichraytiring.
- O'zini hosting qilish (`@fontsource/jetbrains-mono`) — yangi dependency, faqat foydalanuvchi
  ruxsati bilan.

---

## 6. Tuzoqlar (oldin shu joylarda muammo bo'lgan)

- **Signal Forms** (`[formField]`) Optimus `p-select` / `p-datepicker` bilan tip tekshiruvidan
  o'tmaydi. Filtr panellari va dialoglar Reactive Forms'da qoladi (`docs/deferred.md`).
- **`src/styles/layout/typography.css`** `h1`–`h6` ga qatlamsiz (unlayered) o'lcham beradi va
  Tailwind klasslarini bosib ketadi. Sarlavha o'lchami uchun `h2` emas, `div` + klass ishlatilgan.
- **Qator oxirlari:** repo'dagi ko'p fayllar CRLF. `npx prettier --write "src/**"` hammasini
  qayta yozib, keraksiz diff chiqaradi. Faqat o'zgartirgan fayllaringizni formatlang. `docs/*.md`
  ga prettier ishlatmang — tegilmagan hujjatlar ham o'zgarib ketadi.
- Mavjud testlar o'zbekcha matnni tekshiradi (masalan, `error-message.spec.ts`,
  `account.store.spec.ts`). Testlarda standart til `uz` bo'lsin, shunda ular o'zgarishsiz o'tadi.
- `SortField` snake_case bo'lmasa, backend jimgina `id` bo'yicha saralaydi.

---

## 7. Ish tartibi

1. `git status` toza ekanini tekshiring. Toza bo'lmasa — foydalanuvchidan so'rang.
   `main` dan branch oching: `feature/i18n-and-font`.
2. Shrift (3-ish) — kichik, alohida commit.
3. `core/i18n` asosi: locale, store, translator, pipe, sana formatlash, til almashtirgich,
   Optimus tarjimasi + testlar. Alohida commit.
4. Feature'larni birma-bir o'tkazing (`common`/`layout`/`auth` → `exercises` → `foods` → `media` →
   `soldiers` → `accounts` → `user-sessions` → `notifications` → `errors`). Har birida lint/test/build.
5. 2-ish: `LocalizedText` va ma'lumot maydonlari.
6. Hujjatlar: `docs/modules/i18n.md` (yangi: qanday kalit qo'shiladi, lug'at tuzilmasi, qoidalar),
   `CLAUDE.md` ga qisqa bo'lim ("UI matni to'g'ridan-to'g'ri yozilmaydi, `core/i18n` kaliti orqali"),
   o'zgargan `docs/modules/*.md`.
7. Commit xabarlari inglizcha, repo uslubida: birinchi qator — nima qilindi, keyin — **nima uchun**.
   Push va merge faqat foydalanuvchi aytganda.

---

## 8. Qabul qilish mezonlari

- [ ] Topbar'da va login sahifasida til almashtirgich bor. Til almashganda sahifa qayta yuklanmasdan
      hamma matn o'zgaradi: menyu, sarlavhalar, brauzer tab nomi, jadvallar, filtrlar, dialoglar,
      toast'lar, confirm oynalari, xato xabarlari, paginator, datepicker.
- [ ] Tanlangan til sahifa yangilangandan keyin ham saqlanadi. Standart til — o'zbekcha.
- [ ] Kodda (`.ts`/`.html`) UI uchun qattiq yozilgan o'zbekcha matn qolmagan (lug'atlardan tashqari).
- [ ] `ru` yoki `en` lug'atida kalit tushib qolsa, build yiqiladi.
- [ ] Mashq, ovqat va shablon nomlari tanlangan tilda. Bo'sh bo'lsa, zaxira tartibi bo'yicha.
      Tilga mos ustun bo'yicha saralanadi.
- [ ] Sanalar tilga mos formatda, o'zbekchada "M09" kabi buzilgan format yo'q.
- [ ] Butun panel JetBrains Mono'da, Optimus komponentlari ham. 1280px va 375px kengliklarda
      layout buzilmagan.
- [ ] Yangi npm paketi qo'shilmagan (yoki foydalanuvchi aniq ruxsat bergan).
- [ ] `npm run lint`, `npm test`, `npm run build` o'tadi. Yangi kod uchun testlar bor: `LocaleStore`,
      `Translator` (parametrlar, topilmagan kalit), `pickLocalized`, sana formatlash, yangilangan
      mapper'lar.
- [ ] Hujjatlar yangilangan (`docs/modules/i18n.md`, `CLAUDE.md`, tegishli modul hujjatlari).
