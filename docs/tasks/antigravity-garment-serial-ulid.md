# Topshiriq: Garments ekranini backend'ning yangi seriya raqamiga moslash va futbolka suratini olib tashlash

> Kimga: Antigravity (kod yozuvchi agent). Tuzilgan: 2026-09-23.
> Bu hujjat nima o'zgarganini va panelda nima qilish kerakligini aniq belgilaydi. Kod yozishdan oldin
> **to'liq o'qing**, keyin 1-bo'limdagi fayllarni o'qing.

---

## 0. Qisqacha

Backend'da (`D:\Projects\tofan`, commit `db9b512`) Garment moduli ikki joyda o'zgardi:

1. **Seriya raqamini endi server yasaydi.** Admin uni bermaydi. Har futbolka alohida **ULID** oladi:
   26 belgi, Crockford base32 (katta harflar, `I L O U` yo'q), masalan `01K7X8M4Q9F2A6BC3DEFGHJKMN`.
   `POST /admin/garments` so'rovida `serialNumber` maydoni **yo'q**, javobida esa **bor**.
2. **Futbolka surati butunlay olib tashlandi.** `photoFileId` hech qayerda yo'q, `FileCategory.GarmentPhoto = 7`
   enum'dan o'chirildi.

Panelda hozir o'zining seriya standarti bor: `PT-YYMM-COLOR-SIZE-NNNN`, keyingi bo'sh raqamni
ro'yxatdan qidirish, "tartib raqami" maydoni. Bularning **hammasi olib tashlanadi**. Seriya raqamini
panel endi faqat serverdan oladi va ko'rsatadi.

Surat masalasida panel allaqachon `photoFileId` yubormaydi, lekin media bo'limiga `garmentPhoto`
kategoriyasi qo'shilgan. Uni ham olib tashlash kerak, aks holda media sahifasi backend'da endi yo'q
`category = 7` ni yuborishi mumkin.

---

## 1. Loyiha haqida

**Tofan** — fitnes ekotizimi. Bu repozitoriy (`D:\Projects\tofan-ui`) — **faqat admin panel**.
Backend alohida repozitoriyda (`D:\Projects\tofan`, .NET 10, modular monolith). Garments ekrani
NFC futbolkalarni boshqaradi: futbolka yaratish (chipga yoziladigan havola bilan), ro'yxat, holatni
o'zgartirish, muddatni uzaytirish va havolalarni Excel'ga eksport qilish.

**Stack:** Angular 22 (standalone, signals, Signal Forms), TypeScript 6 strict, **Optimus UI 2**
(`@openng/optimus-ui` — PrimeNG 21 ning MIT fork'i), Tailwind 4, Vitest, ESLint, Sheriff.

**Avval o'qing (majburiy):**

| Fayl | Nima uchun |
|---|---|
| `CLAUDE.md`, `AGENTS.md` | Loyihaning qat'iy qoidalari. Siz ham shu qoidalarga bo'ysunasiz |
| `.claude/rules/*.md` | Komponent, store, servis, forma va test qoidalari |
| `docs/modules/garments.md` | Garments feature qanday tuzilgan, tuzoqlari |
| `D:\Projects\tofan\docs\garment-ui-v1.md` | Backend'ning panel uchun API hujjati (yangilangan) |
| `src/app/features/garments` | O'zgartiriladigan feature |

**Eng muhim qoidalar** (to'liq ro'yxat — `CLAUDE.md`):

- Loyiha fayllarida **hech qanday izoh (comment) yo'q** — TS, HTML, CSS, JSON. `npm run lint` yiqiladi.
- `any` yo'q, `!` bilan kompilyatorni jimitish yo'q, `::ng-deep` yo'q.
- Feature boshqa feature'ni import qilmaydi. `core` va `shared` feature'ni import qilmaydi.
- Xatolar backend `code` bo'yicha ajratiladi, matn bo'yicha hech qachon.
- **Yangi npm paketini qo'shmang.**
- Funksiya ≤ 25 qator, komponent ≤ 200, shablon ≤ 150 qator.

**Buyruqlar:**

```bash
npm start      # ng serve, /api -> http://localhost:5179 (backend lokal ishlab turishi kerak)
npm run lint   # ng lint + izohlar tekshiruvi + sheriff verify
npm test       # Vitest
npm run build
```

Ish oxirida uchalasi ham o'tishi shart. Qoidani o'chirib qo'yib "o'tkazish" taqiqlangan.

### ⚠️ Commit qilinmagan ish

Garments feature va unga bog'liq o'zgarishlar (`shared/components/*-field`, `form-dialog`,
`core/feedback/file-download.service.ts`, `calendar-date.ts`, tarjimalar va boshqalar) **hali commit
qilinmagan**, working tree'da turibdi. Shu ish ustiga quring.

- `git checkout`, `git restore`, `git reset`, `git stash`, `git clean` **ishlatmang** — bu ish yo'qoladi.
- **Commit qilmang.** Natijani foydalanuvchi o'zi ko'rib chiqadi.

---

## 2. Backend kontrakti: oldin va keyin

### `POST /admin/garments`

So'rov **oldin**:

```jsonc
{
  "serialNumber": "PT-2609-BLK-L-0007",
  "model": "Peaktofan Classic",
  "color": "black",
  "size": "L",
  "material": "95% paxta, 5% elastan",
  "manufacturedAt": "2026-08-14T00:00:00Z"
}
```

So'rov **keyin** — `serialNumber` yo'q:

```jsonc
{
  "model": "Peaktofan Classic",
  "color": "black",
  "size": "L",
  "material": "95% paxta, 5% elastan",
  "manufacturedAt": "2026-08-14T00:00:00Z"
}
```

Javob **keyin** — `serialNumber` qo'shildi:

```jsonc
{
  "id": "…",
  "serialNumber": "01K7X8M4Q9F2A6BC3DEFGHJKMN",
  "token": "n1gq9Xh2…",
  "linkUrl": "https://nfc.peaktofan.uz/t/n1gq9Xh2…"
}
```

Validatsiya: `model` majburiy (maks. 200), `color`, `size`, `material` ixtiyoriy (maks. 200).
`manufacturedAt` kelajakda bo'lsa → `Garment.ManufacturedInFuture` (o'zgarmadi).

### Xato kodlari

`Garment.SerialNumberInUse` **olib tashlandi** — backend uni endi hech qachon qaytarmaydi.
`POST /admin/garments` endi `409` bermaydi. Qolgan kodlar o'zgarmadi.

### Ro'yxat, filtr, eksport

`GET /admin/garments` va `GET /admin/garments/export-links` o'zgarmadi. `SerialNumber` filtri hamon
qisman moslik (`ILIKE %…%`). ULID vaqt bo'yicha saralanadi, shuning uchun `serial_number` bo'yicha
saralash — yaratilish tartibi.

**Bazada eski `PT-…` seriyali futbolkalar qolishi mumkin.** Ro'yxat ikkala shaklni ham ko'rsatadi.
Panel hech qayerda seriya raqamining shaklini taxmin qilmasligi kerak.

### Media

`FileCategory` da `7` (`GarmentPhoto`) endi yo'q. Backend `category = 7` bilan yuklashni qabul qilmaydi.

---

## 3. Nima qilish kerak

Fayl yo'llari `src/app/` dan boshlanadi.

### 3.1 Panelning seriya standartini o'chirish

- `features/garments/models/garment-serial.ts` va `garment-serial.spec.ts` — **o'chiring**.
  `SERIAL_COLOR_CODES` ham ketadi. Uni boshqa joy ishlatayotgan bo'lsa (masalan, rang yorliqlari),
  o'sha joydan ham olib tashlang.

### 3.2 Model: `features/garments/models/garment-draft.ts`

- `GarmentDraft` dan `serialNumber` ni olib tashlang.
- `SERIAL_NUMBER_MAX_LENGTH`, `SerialNumber.Empty`, `SerialNumber.TooLong`, `SerialNumber.Format`
  tekshiruvlari va `toUpperCase()` — ketadi.
- `Model.Empty`, `Model.TooLong`, `Material.TooLong`, `Garment.ManufacturedInFuture` qoladi.
- `garment-draft.spec.ts` ni shunga moslang.

### 3.3 DTO va mapper: `features/garments/services/`

- `garment.dto.ts`: `CreateGarmentRequest` dan `serialNumber` ni olib tashlang,
  `CreateGarmentResponse` ga `serialNumber: string` qo'shing.
- `garment.mapper.ts`:
  - `toCreateGarmentRequest` endi `serialNumber` yubormaydi.
  - `toCreatedGarment(response)` seriya raqamini **javobdan** oladi. `draft` parametri kerak emas.
- `garment.mapper.spec.ts` ni moslang: so'rovda `serialNumber` yo'qligini va javobdagi `serialNumber`
  `CreatedGarment` ga o'tishini tekshiring.

### 3.4 Servis: `features/garments/services/garments.service.ts`

- `lastSerialNumber()` va `LAST_SERIAL_REQUEST` — **o'chiring**.
- `create()` → `toCreatedGarment(response)`.

### 3.5 Store: `features/garments/garments.store.ts`

- `serialPrefix`, `lastSerialNumber` (resource), `suggestedSequence`, `suggestingSequence`,
  `selectSerialPrefix()` va `create()` ichidagi `this.lastSerialNumber.reload()` — **o'chiring**.
- Toast (`garments.toast.created`) hozir `created.serialNumber` ni ishlatadi. Bu endi serverdan
  kelgan qiymat, o'zgartirish shart emas.
- `garments.store.spec.ts` ni moslang: ketma-ketlikni taklif qilish testlari ketadi.

### 3.6 Forma: `features/garments/components/garment-form-dialog/`

- `garment-form.schema.ts`:
  - `GarmentFormValue` dan `sequence` ni olib tashlang.
  - `serialPrefixOf()`, `sequence` validatorlari (`required`, `min`, `max`) va `ERRORS` dagi
    `sequence`, `sequenceMin`, `sequenceMax` — ketadi.
  - `toGarmentDraft()` endi seriya raqamisiz draft qaytaradi.
  - `garment-form.schema.spec.ts` ni moslang.
- `garment-form-dialog.ts`:
  - `suggestedSequence`, `suggestingSequence` input'lari, `serialPrefixChange` output'i, `prefix` va
    `serialNumber` computed'lari, `formatSerialNumber` importi — ketadi.
  - `linkedSignal` faqat tartib raqamini yangilash uchun edi. Uning o'rniga oddiy
    `signal(emptyGarmentFormValue(...))` yetarli.
  - Ishlatilmay qolgan importlarni (`NumberField`, `outputFromObservable`, `toObservable`,
    `linkedSignal`) olib tashlang.
- `garment-form-dialog.html`: "Seriya raqami" bo'limini (`serialTitle`, tartib raqami maydoni,
  "yorliqdagi raqam", "qidirilmoqda" spinner'i) **butunlay** olib tashlang.

**Partiya bilan kiritish saqlanadi.** Saqlangandan keyin dialog ochiq qoladi, partiya maydonlari
(model, rang, o'lcham, material, sana) o'z joyida turadi, tepada yaratilgan futbolka kartochkasi
chiqadi. Keyingi futbolka uchun admin yana "Saqlash" ni bosadi. Forma saqlangandan keyin
**tozalanmasligi** kerak; faqat dialog qayta ochilganda (`prepare()`) tozalanadi, hozirgidek.

### 3.7 Sahifa: `features/garments/pages/garments-page/`

- `garments-page.html` dagi `<app-garment-form-dialog>` dan `[suggestedSequence]`,
  `[suggestingSequence]`, `(serialPrefixChange)` binding'larini olib tashlang.
- `garments-page.ts` dan `selectSerialPrefix()` ni olib tashlang.

### 3.8 Yaratilgan futbolka kartochkasi: `components/garment-created-panel/`

Seriya raqami endi faqat shu yerda, saqlangandan keyin ko'rinadi. Admin uni futbolka yorlig'iga
yozadi. Shuning uchun:

- Seriya raqamini kartochkada alohida, ko'zga tashlanadigan qilib ko'rsating (`font-mono`, kattaroq).
  Oldin formadagi "yorliqdagi raqam" qanday ko'rsatilgan bo'lsa, shunday.
- Yoniga **nusxa olish** tugmasini qo'ying — havola va token uchun qanday qilingan bo'lsa, xuddi
  shunday (`ClipboardService` yoki kartochka ishlatayotgan mexanizm; yangisini o'ylab topmang).
- 26 belgilik satr tor ekranda sig'ishi kerak (`break-all`).

### 3.9 Filtr: `components/garment-filters/garment-filters.html`

`placeholder="PT-2026"` ni ULID boshlanishiga almashtiring, masalan `01K7`.

### 3.10 Xato xabarlari: `core/feedback/error-message.ts`

`MESSAGES_BY_CODE` dan `'Garment.SerialNumberInUse'` va `'SerialNumber.Format'` ni olib tashlang.

### 3.11 Tarjimalar: `core/i18n/translations/{uz,ru,en}/`

`Dictionary` turi `uz` dan olinadi (`core/i18n/dictionary.ts`), shuning uchun **uchala tilda bir xil**
kalitlarni o'chiring:

- `garments.ts`: `form.serialTitle`, `form.serialHint`, `form.sequence`, `form.printedSerial`,
  `form.serialTemplate`, `form.lookingUp`, `form.errors.sequence`, `form.errors.sequenceMin`,
  `form.errors.sequenceMax`. Nusxa olish tugmasi uchun kalit kerak bo'lsa, `created.*` ostiga qo'shing.
  `form.footer` matniga "seriya raqami serverda yasaladi" degan gap qo'shing.
- `errors.ts`: `backend.Garment.SerialNumberInUse`, `backend.SerialNumber.Format`.
- `media.ts`: `categories.garmentPhoto`.

### 3.12 Fayl kategoriyasi: `shared/models/` va `features/media/`

- `shared/models/file-category.ts`: `FILE_CATEGORIES` dan `'garmentPhoto'` ni olib tashlang.
- `shared/models/file-category.dto.ts`: `GarmentPhoto = 7` ni olib tashlang.
- `features/media/models/file-labels.ts`: `garmentPhoto` yorlig'ini olib tashlang.

### 3.13 Hujjatlar

- `docs/modules/garments.md`:
  - "Purpose" va "Catalogue and serial number standard" dan `PT-YYMM-…` standartini, ketma-ketlikni
    qidirishni, `SerialNumber.Format` ni olib tashlang. O'rniga: seriya raqami serverda yasaladigan
    ULID, panel uni faqat ko'rsatadi, yaratilgan kartochkada nusxa olish mumkin, bazada eski `PT-…`
    seriyalar ham bo'lishi mumkin.
  - "Error codes handled" dan `Garment.SerialNumberInUse` va `SerialNumber.Format` ni olib tashlang.
  - "Traps" dan ikki admin bir vaqtda bir xil raqam olishi haqidagi bandni olib tashlang.
  - "Structure notes" da `components/garment-created-dialog` deb yozilgan — haqiqiy nomi
    `garment-created-panel`, tuzating.
- `docs/backend-contract.md`: garments qatoridan `Garment.SerialNumberInUse` ni olib tashlang;
  `POST /admin/garments` javob shakli tilga olingan bo'lsa, `serialNumber` ni qo'shing.

---

## 4. Qilmaslik kerak

- Seriya raqamini **panelda yasamang va shaklini tekshirmang** (ULID regex ham yo'q). Server yasaydi,
  panel ko'rsatadi.
- Surat uchun hech narsa qoldirmang: yuklash maydoni, kategoriya, "keyinroq kerak bo'lar" deb
  qoldirilgan kod — hech biri.
- Backend repozitoriyiga (`D:\Projects\tofan`) tegmang.
- Yangi npm paketi qo'shmang. Yangi umumiy komponent kerak emas.
- Commit qilinmagan ishni yo'qotadigan git buyruqlarini ishlatmang (1-bo'lim).

---

## 5. Tekshirish

### 5.1 Qidiruv bo'sh qaytishi kerak

`src/` va `docs/` da (`node_modules`, `dist` dan tashqari) quyidagilar **topilmasligi** kerak:

```text
garmentPhoto  GarmentPhoto  SerialNumberInUse  SerialNumber.Format  SerialNumber.Empty
garment-serial  lastSerialNumber  suggestedSequence  suggestingSequence  selectSerialPrefix
serialPrefix  SERIAL_  serialTemplate  printedSerial  lookingUp  PT-YYMM  PT-2609  photoFileId
```

(`docs/tasks/` dagi shu hujjat bundan mustasno.)

### 5.2 Buyruqlar

`npm run lint`, `npm test`, `npm run build` — uchalasi ham o'tadi.

### 5.3 Qo'lda, ishlab turgan backend bilan

Backend `db9b512` yoki undan keyingi commit'da bo'lishi va `RemoveGarmentPhotoMigration` qo'llangan
bo'lishi kerak. Panelga admin bo'lib kirish kerak — **parolni foydalanuvchi o'zi kiritadi**.

1. "Futbolka qo'shish" → partiya maydonlarini to'ldiring → saqlang. Network tab'da `POST /admin/garments`
   tanasida `serialNumber` **yo'q**.
2. Kartochkada 26 belgilik ULID seriya raqami chiqadi, nusxa olish tugmasi ishlaydi, toast'da ham shu
   raqam.
3. Dialog ochiq, partiya maydonlari saqlangan. Yana "Saqlash" → boshqa seriya raqamli ikkinchi
   futbolka.
4. Ro'yxatda ikkala futbolka bor. Filtrga seriya raqamining boshini yozing — topiladi.
5. Media sahifasida kategoriyalar ro'yxatida "Futbolka surati" yo'q.
6. Tilni ru va en ga almashtiring — forma va kartochkada tarjima qilinmagan kalit yo'q.

---

## 6. Tayyor bo'lish mezonlari

- [ ] 3.1–3.13 bandlarining hammasi bajarilgan
- [ ] 5.1 qidiruvi bo'sh
- [ ] `npm run lint`, `npm test`, `npm run build` o'tadi
- [ ] 5.3 qo'lda tekshiruv o'tgan yoki qaysi qadam tekshirilmagani aniq yozilgan
- [ ] Commit qilinmagan, oldingi ish yo'qolmagan
- [ ] Oxirida qisqa hisobot: qaysi fayllar o'zgardi yoki o'chdi, nima tekshirildi, nima tekshirilmadi
